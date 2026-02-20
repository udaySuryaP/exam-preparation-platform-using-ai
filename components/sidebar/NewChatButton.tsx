"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface NewChatButtonProps {
    onNavigate?: () => void;
}

export function NewChatButton({ onNavigate }: NewChatButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push("/chat");
        onNavigate?.();
    };

    return (
        <button
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 text-sm h-[44px]"
        >
            <Plus className="w-4 h-4" />
            New Chat
        </button>
    );
}
