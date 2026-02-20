"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GraduationCap, BookOpen, Brain, Target } from "lucide-react";
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
    const router = useRouter();
    const conversationId = searchParams.get("id");

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<
        string | null
    >(conversationId);

    // Track if we just created a conversation in this session to avoid re-fetching
    const justCreatedRef = useRef(false);

    // Load existing messages when navigating to a conversation
    useEffect(() => {
        setCurrentConversationId(conversationId);

        if (!conversationId) {
            setMessages([]);
            justCreatedRef.current = false;
            return;
        }

        // Skip re-fetch if we just created this conversation (messages are already in state)
        if (justCreatedRef.current) {
            justCreatedRef.current = false;
            return;
        }

        const loadMessages = async () => {
            setIsLoadingHistory(true);
            try {
                const { createClient } = await import("@/lib/supabase/client");
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("messages")
                    .select("*")
                    .eq("conversation_id", conversationId)
                    .order("created_at", { ascending: true });

                console.log("[ChatInterface] loadMessages for:", conversationId);
                console.log("[ChatInterface] raw data:", data);
                console.log("[ChatInterface] error:", error);

                if (data && data.length > 0) {
                    const mapped = data.map((m) => ({
                        id: m.id,
                        conversation_id: m.conversation_id,
                        role: m.role as "user" | "assistant",
                        content: m.content,
                        sources: m.sources,
                        created_at: m.created_at,
                    }));
                    console.log("[ChatInterface] mapped messages:", mapped);
                    setMessages(mapped);
                } else {
                    console.log("[ChatInterface] no messages found, setting empty");
                    setMessages([]);
                }
            } catch (err) {
                console.error("[ChatInterface] loadMessages error:", err);
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

            // If this is a new conversation, poll sidebar updates while API creates conversation
            const isNewConversation = !currentConversationId;
            const pollTimers: ReturnType<typeof setTimeout>[] = [];
            if (isNewConversation) {
                // Fire at staggered intervals so sidebar picks up the new conversation
                // as soon as it's created in the DB (before AI finishes responding)
                [1000, 3000, 5000].forEach((delay) => {
                    pollTimers.push(
                        setTimeout(() => {
                            window.dispatchEvent(new CustomEvent("conversation-created"));
                        }, delay)
                    );
                });
            }

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
                if (isNewConversation && data.conversationId) {
                    setCurrentConversationId(data.conversationId);
                    // Mark that we just created this conversation so the useEffect
                    // doesn't re-fetch and overwrite our local messages
                    justCreatedRef.current = true;
                    router.replace(`/chat?id=${data.conversationId}`, { scroll: false });
                    // Final refresh to ensure sidebar has the latest data
                    window.dispatchEvent(new CustomEvent("conversation-created"));
                }
            } catch (error) {
                const errorMessage: Message = {
                    id: `error-${Date.now()}`,
                    conversation_id: currentConversationId || "",
                    role: "assistant",
                    content:
                        "I apologize, but I encountered an error processing your request. Please try again.",
                    created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
                // Clear any pending poll timers since we got the response
                pollTimers.forEach(clearTimeout);
            }
        },
        [currentConversationId, router]
    );

    const handleRegenerate = useCallback(() => {
        if (messages.length < 2) return;
        const lastUserMsg = [...messages]
            .reverse()
            .find((m) => m.role === "user");
        if (lastUserMsg) {
            setMessages((prev) => prev.slice(0, -1));
            sendMessage(lastUserMsg.content);
        }
    }, [messages, sendMessage]);

    // Loading history state (shown when refreshing on an existing chat)
    if (isLoadingHistory) {
        return (
            <div className="flex-1 flex flex-col bg-main-bg">
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-main-text-tertiary">Loading conversation...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state - only show when there's no active conversation
    if (messages.length === 0 && !conversationId) {
        return (
            <div className="flex-1 flex flex-col bg-main-bg">
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center max-w-lg animate-fade-in">
                        <div className="w-20 h-20 bg-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <GraduationCap className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-[28px] font-semibold text-main-text mb-2 tracking-tight">
                            Start a Conversation
                        </h2>
                        <p className="text-main-text-tertiary mb-8 text-[15px] leading-relaxed">
                            Ask anything from your KTU syllabus and get instant, AI-powered
                            answers.
                        </p>

                        <div className="space-y-3">
                            {SUGGESTED_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(prompt.text)}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-main-border rounded-xl hover:border-accent-blue/30 hover:shadow-md transition-all duration-200 text-left group cursor-pointer"
                                >
                                    <div
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${prompt.color}`}
                                    >
                                        <prompt.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm text-main-text-secondary group-hover:text-main-text transition-colors duration-150">
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
        <div className="flex-1 flex flex-col min-h-0 bg-main-bg">
            <MessageList
                messages={messages}
                isLoading={isLoading}
                onRegenerate={handleRegenerate}
            />
            <InputBox onSend={sendMessage} disabled={isLoading} />
        </div>
    );
}
