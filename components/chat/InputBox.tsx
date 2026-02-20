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
        <div className="border-t border-gray-100 bg-white p-4">
            <div className="max-w-3xl mx-auto">
                <div className="relative flex items-end border-2 border-gray-200 rounded-3xl bg-gray-50 focus-within:border-indigo-400 focus-within:bg-white transition-all duration-200">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything from your syllabus..."
                        disabled={disabled}
                        rows={1}
                        className="flex-1 resize-none bg-transparent px-5 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50 min-h-[44px] max-h-[200px]"
                        aria-label="Message input"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!value.trim() || disabled}
                        className={cn(
                            "m-2 p-2 rounded-full transition-all duration-200 shrink-0",
                            value.trim() && !disabled
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        )}
                        aria-label="Send message"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[11px] text-gray-400 text-center mt-2">
                    KTU Exam Prep AI can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
}
