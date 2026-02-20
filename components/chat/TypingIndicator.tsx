"use client";

import { GraduationCap } from "lucide-react";

export function TypingIndicator() {
    return (
        <div className="flex items-start gap-3 animate-fade-in px-4 md:px-6 py-4">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-purple-500 rounded-full flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="pt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-main-text-tertiary rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-main-text-tertiary rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-main-text-tertiary rounded-full typing-dot" />
                </div>
            </div>
        </div>
    );
}
