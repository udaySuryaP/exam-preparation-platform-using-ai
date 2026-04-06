import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateAnswer } from "@/lib/rag/generate";

const CHAT_RATE_LIMIT = { maxRequests: 20, windowSeconds: 60 };

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
            `chat:${user.id}`,
            CHAT_RATE_LIMIT
        );
        if (!rateResult.allowed) {
            return NextResponse.json(
                {
                    error: "Too many requests. Please wait before sending another message.",
                },
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
        const message: string = body.message;
        const conversationId: string | undefined = body.conversationId;
        const courseId: string | undefined = body.courseId;

        if (
            !message ||
            typeof message !== "string" ||
            message.trim().length === 0
        ) {
            return NextResponse.json(
                { error: "Message is required." },
                { status: 400 }
            );
        }

        if (message.length > 5000) {
            return NextResponse.json(
                { error: "Message too long (max 5000 chars)." },
                { status: 400 }
            );
        }

        if (courseId && !/^[0-9a-f-]{36}$/.test(courseId)) {
            return NextResponse.json(
                { error: "Invalid courseId." },
                { status: 400 }
            );
        }

        if (conversationId && !/^[0-9a-f-]{36}$/.test(conversationId)) {
            return NextResponse.json(
                { error: "Invalid conversationId." },
                { status: 400 }
            );
        }

        let activeConversationId = conversationId;

        if (activeConversationId) {
            const { data: conv, error } = await supabase
                .from("conversations")
                .select("id")
                .eq("id", activeConversationId)
                .eq("user_id", user.id)
                .single();

            if (error || !conv) {
                return NextResponse.json(
                    { error: "Conversation not found." },
                    { status: 404 }
                );
            }
        } else {
            const { data: newConv, error: convError } = await supabase
                .from("conversations")
                .insert({
                    user_id: user.id,
                    title: message.slice(0, 50),
                    course_id: courseId ?? null,
                })
                .select("id")
                .single();

            if (convError || !newConv) {
                return NextResponse.json(
                    { error: "Failed to create conversation." },
                    { status: 500 }
                );
            }
            activeConversationId = newConv.id;
        }

        await supabase.from("messages").insert({
            conversation_id: activeConversationId,
            role: "user",
            content: message.trim(),
        });

        const { data: historyRows } = await supabase
            .from("messages")
            .select("role, content")
            .eq("conversation_id", activeConversationId)
            .order("created_at", { ascending: true })
            .limit(10);

        const history = (historyRows ?? []).map((row) => ({
            role: row.role as "user" | "assistant",
            content: row.content,
        }));

        const { answer, sources } = await generateAnswer(
            message,
            history,
            courseId
        );

        await supabase.from("messages").insert({
            conversation_id: activeConversationId,
            role: "assistant",
            content: answer,
            sources: sources,
        });

        await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", activeConversationId);

        return NextResponse.json({
            answer,
            sources,
            conversationId: activeConversationId,
        });
    } catch (err: unknown) {
        console.error(
            "[/api/chat] ERROR:",
            err instanceof Error ? err.message : "Unknown error"
        );
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
