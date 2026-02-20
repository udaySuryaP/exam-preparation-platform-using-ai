"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputBoxProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function InputBox({ onSend, disabled }: InputBoxProps) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 200) + "px";
        }
    }, [value]);

    const handleSend = () => {
        const trimmed = value.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="sticky bottom-0 bg-main-bg border-t border-main-border p-4 pb-6">
            <div className="max-w-[768px] mx-auto">
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything from your syllabus..."
                        disabled={disabled}
                        rows={1}
                        className="w-full min-h-[52px] max-h-[200px] px-4 pr-14 py-3.5 bg-white border border-main-border rounded-xl text-[15px] text-main-text placeholder:text-main-text-tertiary resize-none transition-all duration-150 focus:outline-none focus:border-accent-blue focus:shadow-focus disabled:opacity-50"
                        aria-label="Message input"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!value.trim() || disabled}
                        className={cn(
                            "absolute right-3 bottom-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150",
                            value.trim() && !disabled
                                ? "bg-accent-blue text-white hover:bg-accent-blue-hover cursor-pointer"
                                : "bg-main-border text-main-text-tertiary cursor-not-allowed"
                        )}
                        aria-label="Send message"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-xs text-main-text-tertiary text-center mt-3">
                    KTU Exam Prep AI can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
}
