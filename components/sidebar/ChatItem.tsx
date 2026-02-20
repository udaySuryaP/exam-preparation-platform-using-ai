"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatItemMenu } from "./ChatItemMenu";

interface ChatItemProps {
    id: string;
    title: string;
    isActive: boolean;
    onRename: (id: string, newTitle: string) => void;
    onDelete: (id: string) => void;
    onNavigate?: () => void;
}

export function ChatItem({ id, title, isActive, onRename, onDelete, onNavigate }: ChatItemProps) {
    const router = useRouter();
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState(title);

    const handleClick = () => {
        if (!isRenaming) {
            router.push(`/chat?id=${id}`);
            onNavigate?.();
        }
    };

    const handleRenameStart = () => {
        setRenameValue(title);
        setIsRenaming(true);
    };

    const handleRenameSubmit = () => {
        const trimmed = renameValue.trim();
        if (trimmed && trimmed !== title) {
            onRename(id, trimmed);
        }
        setIsRenaming(false);
    };

    const handleRenameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleRenameSubmit();
        } else if (e.key === "Escape") {
            setIsRenaming(false);
            setRenameValue(title);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "group flex items-center gap-2.5 h-[44px] px-3 mx-2 rounded-lg mb-0.5 cursor-pointer transition-all duration-150",
                isActive
                    ? "bg-sidebar-surface text-sidebar-text"
                    : "text-sidebar-text-secondary hover:bg-sidebar-hover hover:text-sidebar-text"
            )}
        >
            {/* Icon */}
            <div
                className={cn(
                    "w-7 h-7 min-w-7 rounded-md flex items-center justify-center text-base shrink-0",
                    isActive ? "bg-sidebar-hover" : "bg-transparent"
                )}
            >
                <MessageSquare className="w-4 h-4" />
            </div>

            {/* Title or Rename Input */}
            {isRenaming ? (
                <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleRenameKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    maxLength={100}
                    className="flex-1 min-w-0 text-sm bg-sidebar-bg border border-accent-blue rounded px-1.5 py-0.5 text-sidebar-text focus:outline-none focus:ring-1 focus:ring-accent-blue"
                />
            ) : (
                <span className="flex-1 min-w-0 text-sm font-normal truncate">
                    {title}
                </span>
            )}

            {/* Menu */}
            {!isRenaming && (
                <ChatItemMenu
                    chatId={id}
                    onRename={() => handleRenameStart()}
                    onDelete={() => onDelete(id)}
                />
            )}
        </div>
    );
}
