import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("id");

        if (!conversationId) {
            // List all conversations for the user
            const { data: conversations, error: convError } = await supabase
                .from("conversations")
                .select("id, title, created_at, updated_at")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false })
                .limit(10);

            return NextResponse.json({
                user: user.id,
                conversations,
                convError,
            });
        }

        // Get messages for the conversation
        const { data: messages, error: msgError } = await supabase
            .from("messages")
            .select("id, role, content, created_at")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

        // Also check with service role to compare
        const { createServiceClient } = await import("@/lib/supabase/server");
        const serviceClient = await createServiceClient();
        const { data: serviceMessages, error: serviceMsgError } = await serviceClient
            .from("messages")
            .select("id, role, content, created_at")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

        return NextResponse.json({
            user: user.id,
            conversationId,
            messagesViaRLS: {
                count: messages?.length || 0,
                data: messages?.map((m) => ({
                    id: m.id,
                    role: m.role,
                    contentPreview: m.content?.substring(0, 80),
                    created_at: m.created_at,
                })),
                error: msgError,
            },
            messagesViaService: {
                count: serviceMessages?.length || 0,
                data: serviceMessages?.map((m) => ({
                    id: m.id,
                    role: m.role,
                    contentPreview: m.content?.substring(0, 80),
                    created_at: m.created_at,
                })),
                error: serviceMsgError,
            },
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Internal server error", details: String(err) },
            { status: 500 }
        );
    }
}
