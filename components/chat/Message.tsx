"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, RefreshCw } from "lucide-react";
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
                "flex gap-3 animate-slide-up-fade",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <span className="text-sm">🤖</span>
                </div>
            )}

            <div
                className={cn(
                    "relative group",
                    isUser ? "max-w-[70%]" : "max-w-[85%]"
                )}
            >
                <div
                    className={cn(
                        "px-4 py-3 text-sm leading-relaxed",
                        isUser
                            ? "bg-indigo-600 text-white rounded-[18px_18px_4px_18px]"
                            : "bg-gray-100 text-gray-900 rounded-[18px_18px_18px_4px]"
                    )}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-indigo-700 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-a:text-indigo-600">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    pre: ({ children }) => (
                                        <pre className="relative group/code overflow-x-auto rounded-lg p-4 my-2 bg-gray-900 text-gray-100 text-xs">
                                            {children}
                                        </pre>
                                    ),
                                    code: ({ className, children, ...props }) => {
                                        const isBlock = className?.includes("language-");
                                        if (isBlock) {
                                            return (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return (
                                            <code
                                                className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono"
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
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {message.sources.map((source, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-500"
                            >
                                📄 {source.course_code} {source.module}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                {!isUser && (
                    <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                            aria-label="Copy message"
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                        </button>
                        {onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                                aria-label="Regenerate response"
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {isUser && (
                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shrink-0 mt-1 text-xs font-bold">
                    U
                </div>
            )}
        </div>
    );
}
