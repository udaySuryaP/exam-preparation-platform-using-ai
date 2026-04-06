import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const STUDY_TIME_RATE_LIMIT = { maxRequests: 30, windowSeconds: 60 };

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rateResult = await checkRateLimit(`study-time:${user.id}`, STUDY_TIME_RATE_LIMIT);
        if (!rateResult.allowed) {
            return NextResponse.json(
                { error: "Too many requests." },
                { status: 429 }
            );
        }

        const body = await request.json();
        const seconds = Number(body.seconds);

        // Validate: must be a positive number, max 5 minutes per save (to prevent abuse)
        if (!Number.isFinite(seconds) || seconds < 1 || seconds > 300) {
            return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
        }

        const minutesToAdd = seconds / 60; // Store as fractional minutes for precision

        // Use RPC to atomically increment study_time_minutes
        const { error } = await supabase.rpc("increment_study_time", {
            user_uuid: user.id,
            minutes_to_add: minutesToAdd,
        });

        if (error) {
            // Fallback: retry via direct PostgREST fetch to the same atomic RPC
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
            const fallbackRes = await fetch(
                `${supabaseUrl}/rest/v1/rpc/increment_study_time`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": supabaseKey,
                        "Authorization": `Bearer ${supabaseKey}`,
                    },
                    body: JSON.stringify({
                        user_uuid: user.id,
                        minutes_to_add: minutesToAdd,
                    }),
                }
            );
            if (!fallbackRes.ok) {
                console.error("[study-time] Fallback RPC failed:", await fallbackRes.text());
            }
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
