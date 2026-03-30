import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { searchSyllabus, formatContext } from "@/lib/rag/search";

const SEARCH_RATE_LIMIT = { maxRequests: 30, windowSeconds: 60 };

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const rateResult = await checkRateLimit(
            `search:${user.id}`,
            SEARCH_RATE_LIMIT
        );
        if (!rateResult.allowed) {
            return NextResponse.json(
                { error: "Too many requests." },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": String(rateResult.remaining),
                        "X-RateLimit-Reset": String(rateResult.resetAt),
                    },
                }
            );
        }

        const body = await req.json();
        const query: string = body.query;
        const courseId: string | undefined = body.courseId;

        if (!query || typeof query !== "string" || query.trim().length === 0) {
            return NextResponse.json(
                { error: "Query is required." },
                { status: 400 }
            );
        }

        if (query.length > 1000) {
            return NextResponse.json(
                { error: "Query too long." },
                { status: 400 }
            );
        }

        if (courseId && !/^[0-9a-f-]{36}$/.test(courseId)) {
            return NextResponse.json(
                { error: "Invalid courseId." },
                { status: 400 }
            );
        }

        const matches = await searchSyllabus(query, courseId);
        const context = formatContext(matches);

        return NextResponse.json({ matches, context });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Unknown error";
        console.error("[/api/search]", message);
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}