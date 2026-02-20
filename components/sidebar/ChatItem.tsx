"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
                "group flex items-center gap-2.5 h-12 px-3 rounded-md mb-1 cursor-pointer transition-all duration-150",
                isActive
                    ? "bg-indigo-50 border-l-[3px] border-indigo-600"
                    : "hover:bg-gray-100"
            )}
        >
            <MessageSquare
                className={cn(
                    "w-[18px] h-[18px] shrink-0",
                    isActive ? "text-indigo-600" : "text-gray-400"
                )}
            />

            {isRenaming ? (
                <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleRenameKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    maxLength={100}
                    className="flex-1 min-w-0 text-sm bg-white border border-indigo-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            ) : (
                <span
                    className={cn(
                        "flex-1 min-w-0 text-sm font-medium truncate",
                        isActive ? "text-indigo-900" : "text-gray-700"
                    )}
                >
                    {title}
                </span>
            )}

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
