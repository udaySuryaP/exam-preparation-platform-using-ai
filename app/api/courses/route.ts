import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const semester = searchParams.get("semester");
        const limitParam = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
        const offsetParam = Number(searchParams.get("offset") ?? 0);

        // Validate pagination params
        const limit = Math.min(Math.max(1, limitParam), MAX_LIMIT);
        const offset = Math.max(0, offsetParam);

        let query = supabase
            .from("courses")
            .select("*", { count: "exact" })
            .order("semester")
            .order("course_code")
            .range(offset, offset + limit - 1);

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

        const { data, error, count } = await query;

        if (error) {
            return NextResponse.json(
                { error: "Failed to fetch courses" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            courses: data || [],
            total: count ?? 0,
            limit,
            offset,
        });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
