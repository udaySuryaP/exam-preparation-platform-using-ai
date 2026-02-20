"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function UserProfile() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient();
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();

            if (authUser) {
                const { data: profile } = await supabase
                    .from("user_profiles")
                    .select("full_name")
                    .eq("id", authUser.id)
                    .single();

                setUser({
                    name: profile?.full_name || authUser.user_metadata?.full_name || "User",
                    email: authUser.email || "",
                });
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [menuOpen]);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    if (!user) return null;

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div ref={menuRef} className="relative">
            {/* Dropdown menu (opens upward) */}
            {menuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                    <button
                        onClick={() => {
                            setMenuOpen(false);
                            router.push("/profile");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                    >
                        <Settings className="w-4 h-4" />
                        Profile Settings
                    </button>
                    <div className="mx-2 border-t border-gray-100 my-1" />
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-accent-red hover:bg-red-50 transition-colors duration-150"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            )}

            {/* User profile trigger */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-sidebar-hover rounded-lg transition-colors duration-150"
            >
                <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {initials || "U"}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-sidebar-text truncate">{user.name}</p>
                    <p className="text-xs text-sidebar-text-tertiary truncate">{user.email}</p>
                </div>
                <ChevronUp
                    className={`w-4 h-4 text-sidebar-text-tertiary transition-transform duration-200 ${menuOpen ? "rotate-180" : ""
                        }`}
                />
            </button>
        </div>
    );
}
