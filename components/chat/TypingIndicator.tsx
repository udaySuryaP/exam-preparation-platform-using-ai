"use client";

export function TypingIndicator() {
    return (
        <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-sm">🤖</span>
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl px-4 py-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                </div>
            </div>
        </div>
    );
}
