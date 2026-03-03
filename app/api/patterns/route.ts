import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const PUBLIC_RATE_LIMIT = { maxRequests: 60, windowSeconds: 60 };

export async function GET(request: NextRequest) {
    try {
        // IP-based rate limiting for public endpoint
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const rateResult = await checkRateLimit(`patterns:${ip}`, PUBLIC_RATE_LIMIT);
        if (!rateResult.allowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");
        const limitParam = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
        const offsetParam = Number(searchParams.get("offset") ?? 0);

        // Validate pagination params
        const limit = Math.min(Math.max(1, limitParam), MAX_LIMIT);
        const offset = Math.max(0, offsetParam);

        let query = supabase
            .from("question_patterns")
            .select("*, course:courses(*)", { count: "exact" })
            .order("total_frequency", { ascending: false })
            .range(offset, offset + limit - 1);

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

        const { data, error, count } = await query;

        if (error) {
            return NextResponse.json(
                { error: "Failed to fetch patterns" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            patterns: data || [],
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
