import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_MESSAGE_LENGTH = 5000;
const CHAT_RATE_LIMIT = { maxRequests: 20, windowSeconds: 60 }; // 20 req/min per user

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting per user (Upstash Redis — works across all devices/instances)
        const rateResult = await checkRateLimit(`chat:${user.id}`, CHAT_RATE_LIMIT);
        if (!rateResult.allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a moment before sending another message." },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": String(rateResult.remaining),
                        "X-RateLimit-Reset": String(rateResult.resetAt),
                    },
                }
            );
        }

        const { message, courseId, conversationId } = await request.json();

        // Validate message
        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        if (message.trim().length === 0) {
            return NextResponse.json(
                { error: "Message cannot be empty" },
                { status: 400 }
            );
        }

        if (message.length > MAX_MESSAGE_LENGTH) {
            return NextResponse.json(
                { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` },
                { status: 400 }
            );
        }

        // Get or create conversation, with ownership verification
        let convId = conversationId;
        if (convId) {
            // Verify the conversation belongs to this user
            const { data: existingConv, error: convLookupError } = await supabase
                .from("conversations")
                .select("id, user_id")
                .eq("id", convId)
                .single();

            if (convLookupError || !existingConv || existingConv.user_id !== user.id) {
                return NextResponse.json(
                    { error: "Conversation not found" },
                    { status: 404 }
                );
            }
        } else {
            const title =
                message.length > 50 ? message.slice(0, 50) + "..." : message;
            const { data: newConv, error: convError } = await supabase
                .from("conversations")
                .insert({
                    user_id: user.id,
                    title,
                    course_id: courseId || null,
                })
                .select()
                .single();

            if (convError) {
                return NextResponse.json(
                    { error: "Failed to create conversation" },
                    { status: 500 }
                );
            }
            convId = newConv.id;
        }

        // Save user message
        await supabase.from("messages").insert({
            conversation_id: convId,
            role: "user",
            content: message.trim(),
        });

        // Get recent conversation history (last 10 messages)
        const { data: history } = await supabase
            .from("messages")
            .select("role, content")
            .eq("conversation_id", convId)
            .order("created_at", { ascending: false })
            .limit(10);

        // TODO: Integrate OpenAI + RAG here
        // const { answer, sources } = await generateAnswer(
        //     message.trim(),
        //     courseId,
        //     (history || []).reverse() as { role: "user" | "assistant"; content: string }[]
        // );

        const answer =
            "AI responses are not enabled yet. This feature is coming soon 🚀";

        // Save assistant placeholder message
        await supabase.from("messages").insert({
            conversation_id: convId,
            role: "assistant",
            content: answer,
            sources: [],
        });

        // Update conversation timestamp
        await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", convId);

        return NextResponse.json({
            answer,
            sources: [],
            conversationId: convId,
        });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
