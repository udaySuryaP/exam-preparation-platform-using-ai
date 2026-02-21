import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_QUERY_LENGTH = 2000;
const SEARCH_RATE_LIMIT = { maxRequests: 30, windowSeconds: 60 };

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rateResult = await checkRateLimit(
            `search:${user.id}`,
            SEARCH_RATE_LIMIT
        );

        if (!rateResult.allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a moment." },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": String(rateResult.remaining),
                        "X-RateLimit-Reset": String(rateResult.resetAt),
                    },
                }
            );
        }

        const { query } = await request.json();

        if (!query || typeof query !== "string" || query.trim().length === 0) {
            return NextResponse.json(
                { error: "Query is required" },
                { status: 400 }
            );
        }

        if (query.length > MAX_QUERY_LENGTH) {
            return NextResponse.json(
                { error: `Query too long. Maximum ${MAX_QUERY_LENGTH} characters.` },
                { status: 400 }
            );
        }

        // TODO: Integrate RAG search using match_syllabus()
        return NextResponse.json({
            results: [],
            message: "Search is not enabled yet",
        });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}