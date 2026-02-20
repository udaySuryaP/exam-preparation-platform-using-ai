"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, RefreshCw, GraduationCap } from "lucide-react";
import type { Message as MessageType } from "@/types";
import { cn } from "@/lib/utils";

interface MessageProps {
    message: MessageType;
    onRegenerate?: () => void;
}

export function Message({ message, onRegenerate }: MessageProps) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === "user";

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={cn(
                "flex gap-3 py-4 px-4 md:px-6 animate-slide-up-fade transition-colors duration-150",
                isUser ? "justify-end" : "justify-start",
                !isUser && "hover:bg-black/[0.02]"
            )}
        >
            {/* AI Avatar */}
            {!isUser && (
                <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-purple-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="w-4 h-4 text-white" />
                </div>
            )}

            <div
                className={cn(
                    "relative group",
                    isUser ? "max-w-[70%]" : "max-w-[720px] flex-1"
                )}
            >
                {/* Message Bubble */}
                <div
                    className={cn(
                        "text-[15px] leading-relaxed",
                        isUser
                            ? "bg-message-user text-main-text px-4 py-3 rounded-2xl rounded-br-sm"
                            : "text-main-text"
                    )}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-sm max-w-none prose-headings:text-main-text prose-headings:font-semibold prose-p:text-main-text-secondary prose-p:leading-relaxed prose-strong:text-main-text prose-code:text-accent-blue prose-code:bg-accent-blue-light prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[13px] prose-code:font-mono prose-pre:bg-[#1e293b] prose-pre:text-[#e2e8f0] prose-a:text-accent-blue prose-a:no-underline hover:prose-a:underline prose-li:text-main-text-secondary">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    pre: ({ children }) => (
                                        <pre className="relative group/code overflow-x-auto rounded-xl p-4 my-3 bg-[#1e293b] text-[#e2e8f0] text-[13px] leading-relaxed border border-[#334155]">
                                            {children}
                                        </pre>
                                    ),
                                    code: ({ className, children, ...props }) => {
                                        const isBlock = className?.includes("language-");
                                        if (isBlock) {
                                            return (
                                                <code className={cn(className, "font-mono")} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return (
                                            <code
                                                className="bg-accent-blue-light text-accent-blue px-1.5 py-0.5 rounded-md text-[13px] font-mono"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Sources */}
                {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {message.sources.map((source, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-1 bg-main-surface border border-main-border rounded-lg text-xs text-main-text-tertiary"
                            >
                                📄 {source.course_code} {source.module}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                {!isUser && (
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-lg hover:bg-main-surface transition-colors duration-150"
                            aria-label="Copy message"
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5 text-accent-teal" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 text-main-text-tertiary" />
                            )}
                        </button>
                        {onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                className="p-1.5 rounded-lg hover:bg-main-surface transition-colors duration-150"
                                aria-label="Regenerate response"
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-main-text-tertiary" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* User Avatar */}
            {isUser && (
                <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-purple-500 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white">
                    U
                </div>
            )}
        </div>
    );
}
