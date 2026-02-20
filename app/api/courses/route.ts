import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const semester = searchParams.get("semester");

        let query = supabase
            .from("courses")
            .select("*")
            .order("semester")
            .order("course_code");

        if (semester) {
            const s = Number(semester);
            if (!Number.isInteger(s) || s < 1 || s > 8) {
                return NextResponse.json(
                    { error: "Invalid semester. Must be 1-8." },
                    { status: 400 }
                );
            }
            query = query.eq("semester", s);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json(
                { error: "Failed to fetch courses" },
                { status: 500 }
            );
        }

        return NextResponse.json({ courses: data || [] });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
