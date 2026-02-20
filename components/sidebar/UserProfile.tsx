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
                // Try to get profile name first, fall back to auth metadata
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
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                    <button
                        onClick={() => {
                            setMenuOpen(false);
                            router.push("/profile");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Profile Settings
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            )}

            {/* User profile trigger */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {initials || "U"}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <ChevronUp
                    className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""
                        }`}
                />
            </button>
        </div>
    );
}
