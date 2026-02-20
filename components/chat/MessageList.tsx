"use client";

import { useRef, useEffect } from "react";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";
import type { Message as MessageType } from "@/types";

interface MessageListProps {
    messages: MessageType[];
    isLoading: boolean;
    onRegenerate?: () => void;
}

export function MessageList({
    messages,
    isLoading,
    onRegenerate,
}: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg, i) => (
                    <Message
                        key={msg.id || i}
                        message={msg}
                        onRegenerate={
                            i === messages.length - 1 && msg.role === "assistant"
                                ? onRegenerate
                                : undefined
                        }
                    />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
