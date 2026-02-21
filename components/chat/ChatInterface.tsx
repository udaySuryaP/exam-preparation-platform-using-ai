"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GraduationCap, BookOpen, Brain, Target, Loader2 } from "lucide-react";
import { MessageList } from "./MessageList";
import { InputBox } from "./InputBox";
import type { Message } from "@/types";

const SUGGESTED_PROMPTS = [
    {
        icon: BookOpen,
        text: "Explain the OSI model layers",
        color: "text-blue-600 bg-blue-50",
    },
    {
        icon: Brain,
        text: "What is Dijkstra's algorithm?",
        color: "text-indigo-600 bg-indigo-50",
    },
    {
        icon: Target,
        text: "Important topics in Data Structures",
        color: "text-emerald-600 bg-emerald-50",
    },
];

export function ChatInterface() {
    const searchParams = useSearchParams();
    const conversationId = searchParams.get("id");

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<
        string | null
    >(conversationId);

    // Load existing messages when navigating to a conversation
    useEffect(() => {
        setCurrentConversationId(conversationId);

        if (!conversationId) {
            setMessages([]);
            return;
        }

        const loadMessages = async () => {
            setIsLoadingHistory(true);
            try {
                const { createClient } = await import("@/lib/supabase/client");
                const supabase = createClient();
                const { data } = await supabase
                    .from("messages")
                    .select("*")
                    .eq("conversation_id", conversationId)
                    .order("created_at", { ascending: true });

                if (data && data.length > 0) {
                    setMessages(
                        data.map((m) => ({
                            id: m.id,
                            conversation_id: m.conversation_id,
                            role: m.role as "user" | "assistant",
                            content: m.content,
                            sources: m.sources,
                            created_at: m.created_at,
                        }))
                    );
                } else {
                    setMessages([]);
                }
            } catch {
                setMessages([]);
            }
            setIsLoadingHistory(false);
        };

        loadMessages();
    }, [conversationId]);

    const sendMessage = useCallback(
        async (content: string) => {
            const userMessage: Message = {
                id: `user-${Date.now()}`,
                conversation_id: currentConversationId || "",
                role: "user",
                content,
                created_at: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);

            try {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: content,
                        conversationId: currentConversationId,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to get response");
                }

                const aiMessage: Message = {
                    id: `ai-${Date.now()}`,
                    conversation_id: data.conversationId,
                    role: "assistant",
                    content: data.answer,
                    sources: data.sources,
                    created_at: new Date().toISOString(),
                };

                setMessages((prev) => [...prev, aiMessage]);
                if (!currentConversationId && data.conversationId) {
                    setCurrentConversationId(data.conversationId);
                    // Update URL so sidebar highlights this conversation
                    window.history.replaceState(null, "", `/chat?id=${data.conversationId}`);
                }
            } catch (error) {
                const errorMessage: Message = {
                    id: `error-${Date.now()}`,
                    conversation_id: currentConversationId || "",
                    role: "assistant",
                    content:
                        error instanceof Error && error.message.includes("Too many requests")
                            ? "⏱️ You're sending messages too fast. Please wait a moment before trying again."
                            : "I apologize, but I encountered an error processing your request. Please try again.",
                    created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        },
        [currentConversationId]
    );

    const handleRegenerate = useCallback(() => {
        // Find the last user message and remove everything after it
        const lastUserIndex = [...messages].map(m => m.role).lastIndexOf("user");
        if (lastUserIndex === -1) return;
        const lastUserMsg = messages[lastUserIndex];
        setMessages((prev) => prev.slice(0, lastUserIndex));
        sendMessage(lastUserMsg.content);
    }, [messages, sendMessage]);

    // Loading history state — show a spinner instead of the empty state
    if (isLoadingHistory) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm">Loading conversation...</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center max-w-lg animate-fade-in">
                        <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <GraduationCap className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Start a Conversation
                        </h2>
                        <p className="text-gray-500 mb-8">
                            Ask anything from your KTU syllabus and get instant, AI-powered
                            answers.
                        </p>

                        <div className="space-y-3">
                            {SUGGESTED_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(prompt.text)}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all duration-200 text-left group"
                                >
                                    <div
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${prompt.color}`}
                                    >
                                        <prompt.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm text-gray-700 group-hover:text-indigo-700 transition-colors">
                                        {prompt.text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <InputBox onSend={sendMessage} disabled={isLoading} />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <MessageList
                messages={messages}
                isLoading={isLoading}
                onRegenerate={handleRegenerate}
            />
            <InputBox onSend={sendMessage} disabled={isLoading} />
        </div>
    );
}
