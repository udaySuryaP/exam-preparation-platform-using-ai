"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
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
    const activeId = searchParams.get("id");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();

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

        // Real-time subscription
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

    const handleRename = async (id: string, newTitle: string) => {
        // Optimistic update
        setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
        );

        const { error } = await supabase
            .from("conversations")
            .update({ title: newTitle })
            .eq("id", id);

        if (error) {
            // Revert on failure
            fetchConversations();
        }
    };

    const handleDelete = async (id: string) => {
        // Optimistic update
        setConversations((prev) => prev.filter((c) => c.id !== id));

        // Delete messages first, then conversation
        await supabase.from("messages").delete().eq("conversation_id", id);
        const { error } = await supabase.from("conversations").delete().eq("id", id);

        if (error) {
            fetchConversations();
        }
    };

    if (isLoading) {
        return (
            <div className="px-5 py-4">
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded-md animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-0 flex-1">
            <div className="px-5 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Recent Chats
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-3 scrollbar-thin">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">No chats yet</p>
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
