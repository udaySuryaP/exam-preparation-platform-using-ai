import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");

        let query = supabase
            .from("question_patterns")
            .select("*, course:courses(*)")
            .order("total_frequency", { ascending: false });

        if (courseId) {
            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(courseId)) {
                return NextResponse.json(
                    { error: "Invalid course ID format" },
                    { status: 400 }
                );
            }
            query = query.eq("course_id", courseId);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json(
                { error: "Failed to fetch patterns" },
                { status: 500 }
            );
        }

        return NextResponse.json({ patterns: data || [] });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
