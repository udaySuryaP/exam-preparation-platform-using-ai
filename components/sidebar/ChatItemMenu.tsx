"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface ChatItemMenuProps {
    chatId: string;
    onRename: (id: string) => void;
    onDelete: (id: string) => void;
}

export function ChatItemMenu({ chatId, onRename, onDelete }: ChatItemMenuProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [open]);

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(!open);
                }}
                className="p-1 rounded hover:bg-sidebar-border transition-colors duration-150 opacity-0 group-hover:opacity-100 data-[open=true]:opacity-100"
                data-open={open}
                aria-label="Chat options"
            >
                <MoreVertical className="w-4 h-4 text-sidebar-text-secondary" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpen(false);
                            onRename(chatId);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                    >
                        <Pencil className="w-4 h-4" />
                        Rename
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpen(false);
                            onDelete(chatId);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent-red hover:bg-red-50 transition-colors duration-150"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
