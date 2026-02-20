"use client";

import { Suspense } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
    return (
        <Suspense
            fallback={
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            }
        >
            <ChatInterface />
        </Suspense>
    );
}
