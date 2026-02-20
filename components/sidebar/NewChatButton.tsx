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
            className="w-full flex items-center justify-center gap-2 h-[44px] border border-sidebar-border rounded-lg text-sm font-medium text-sidebar-text hover:bg-sidebar-hover hover:border-sidebar-text-secondary active:scale-[0.98] transition-all duration-150 cursor-pointer"
        >
            <Plus className="w-[18px] h-[18px]" strokeWidth={2} />
            New Chat
        </button>
    );
}
