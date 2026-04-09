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

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

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
            console.error("[study-time] RPC failed:", error.message);
            return NextResponse.json({ error: "Failed to save study time" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
