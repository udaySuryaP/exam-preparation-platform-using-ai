"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ChatItem } from "./ChatItem";

interface Conversation {
    id: string;
    title: string;
    updated_at: string;
    created_at: string;
}

interface RecentChatsProps {
    onNavigate?: () => void;
}

export function RecentChats({ onNavigate }: RecentChatsProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeId = searchParams.get("id");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Memoize the Supabase client so it's created once
    const supabase = useMemo(() => createClient(), []);

    const fetchConversations = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
            .from("conversations")
            .select("id, title, updated_at, created_at")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(50);

        setConversations(data || []);
        setIsLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchConversations();

        const channel = supabase
            .channel("conversations-changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "conversations",
                },
                () => {
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchConversations, supabase]);

    // Listen for custom event when a new conversation is created (reliable fallback)
    useEffect(() => {
        const handleNewConversation = () => {
            fetchConversations();
        };
        window.addEventListener("conversation-created", handleNewConversation);
        return () => {
            window.removeEventListener("conversation-created", handleNewConversation);
        };
    }, [fetchConversations]);

    const handleRename = async (id: string, newTitle: string) => {
        setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
        );

        const { error } = await supabase
            .from("conversations")
            .update({ title: newTitle })
            .eq("id", id);

        if (error) {
            fetchConversations();
        }
    };

    const handleDelete = async (id: string) => {
        setConversations((prev) => prev.filter((c) => c.id !== id));

        // If deleting the active chat, navigate away
        if (activeId === id) {
            router.push("/chat");
        }

        await supabase.from("messages").delete().eq("conversation_id", id);
        const { error } = await supabase.from("conversations").delete().eq("id", id);

        if (error) {
            fetchConversations();
        }
    };

    if (isLoading) {
        return (
            <div className="px-4 py-4">
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-sidebar-surface rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-0 flex-1">
            <div className="px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.05em] text-sidebar-text-tertiary">
                    Recent Chats
                </span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                        <MessageSquare className="w-8 h-8 text-sidebar-text-tertiary mb-2" />
                        <p className="text-sm text-sidebar-text-tertiary">No chats yet</p>
                        <p className="text-xs text-sidebar-text-tertiary mt-1 opacity-70">
                            Start a new conversation
                        </p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <ChatItem
                            key={conv.id}
                            id={conv.id}
                            title={conv.title}
                            isActive={activeId === conv.id}
                            onRename={handleRename}
                            onDelete={handleDelete}
                            onNavigate={onNavigate}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
