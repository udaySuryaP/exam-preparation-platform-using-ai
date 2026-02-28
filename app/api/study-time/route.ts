import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const seconds = Number(body.seconds);

        // Validate: must be a positive number, max 5 minutes per save (to prevent abuse)
        if (!Number.isFinite(seconds) || seconds < 1 || seconds > 300) {
            return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
        }

        const minutesToAdd = seconds / 60; // Store as fractional minutes for precision

        // Use raw SQL to atomically increment study_time_minutes
        const { error } = await supabase.rpc("increment_study_time", {
            user_uuid: user.id,
            minutes_to_add: minutesToAdd,
        });

        if (error) {
            // Fallback: try direct update if RPC doesn't exist yet
            const { data: profile } = await supabase
                .from("user_profiles")
                .select("study_time_minutes")
                .eq("id", user.id)
                .single();

            const currentMinutes = profile?.study_time_minutes || 0;

            await supabase
                .from("user_profiles")
                .update({ study_time_minutes: currentMinutes + minutesToAdd })
                .eq("id", user.id);
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
