"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    GraduationCap,
    Plus,
    MessageSquare,
    MoreVertical,
    User,
    Settings,
    BarChart3,
    LogOut,
    BookOpen,
    TrendingUp,
    Menu,
    X,
    ChevronDown,
} from "lucide-react";
import Link from "next/link";
import type { Conversation } from "@/types";
import { cn, getInitials, truncate } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [chatMenuId, setChatMenuId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUserName(user.user_metadata?.full_name || "User");
                setUserEmail(user.email || "");

                const { data: convos } = await supabase
                    .from("conversations")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("updated_at", { ascending: false })
                    .limit(20);

                if (convos) setConversations(convos);
            }
        };

        loadData();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const handleNewChat = () => {
        router.push("/chat");
        setSidebarOpen(false);
    };

    const handleDeleteChat = async (id: string) => {
        const supabase = createClient();
        await supabase.from("messages").delete().eq("conversation_id", id);
        await supabase.from("conversations").delete().eq("id", id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        setChatMenuId(null);
        if (pathname === `/chat?id=${id}`) router.push("/chat");
    };

    const navItems = [
        { href: "/chat", label: "Chat", icon: MessageSquare },
        { href: "/courses", label: "Courses", icon: BookOpen },
        { href: "/patterns", label: "Patterns", icon: TrendingUp },
        { href: "/profile", label: "Profile", icon: User },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-base font-bold text-gray-900">
                        KTU Exam Prep AI
                    </span>
                </div>
            </div>

            {/* New Chat */}
            <div className="p-4">
                <button
                    onClick={handleNewChat}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Chat
                </button>
            </div>

            {/* Navigation */}
            <div className="px-3 mb-4">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-1",
                            pathname === item.href
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </Link>
                ))}
            </div>

            {/* Recent Chats */}
            <div className="flex-1 overflow-y-auto px-3">
                <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Recent Chats
                </p>
                <div className="space-y-0.5">
                    {conversations.length === 0 ? (
                        <p className="px-3 py-4 text-xs text-gray-400 text-center">
                            No conversations yet
                        </p>
                    ) : (
                        conversations.map((conv) => (
                            <div key={conv.id} className="relative group">
                                <Link
                                    href={`/chat?id=${conv.id}`}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                                        pathname === `/chat` &&
                                            searchParams.get("id") === conv.id
                                            ? "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-500"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <span className="text-base">💬</span>
                                    <span className="flex-1 truncate text-[13px]">
                                        {truncate(conv.title, 28)}
                                    </span>
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setChatMenuId(chatMenuId === conv.id ? null : conv.id);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all"
                                    aria-label="Chat options"
                                >
                                    <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                                {chatMenuId === conv.id && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 w-36">
                                        <button
                                            onClick={() => handleDeleteChat(conv.id)}
                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* User Profile Section */}
            <div className="border-t border-gray-100 p-4 relative">
                <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all"
                >
                    <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {getInitials(userName)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {userName}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
                    </div>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-gray-400 transition-transform",
                            userMenuOpen && "rotate-180"
                        )}
                    />
                </button>

                {userMenuOpen && (
                    <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                        <Link
                            href="/profile"
                            onClick={() => {
                                setUserMenuOpen(false);
                                setSidebarOpen(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            Profile
                        </Link>
                        <Link
                            href="/profile"
                            onClick={() => {
                                setUserMenuOpen(false);
                                setSidebarOpen(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>
                        <Link
                            href="/profile"
                            onClick={() => {
                                setUserMenuOpen(false);
                                setSidebarOpen(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Usage Stats
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-screen flex bg-white overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-[280px] flex-col border-r border-gray-100 bg-white shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 transform transition-transform duration-300 shadow-xl",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close sidebar"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Open sidebar"
                    >
                        <Menu className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                            KTU Exam Prep AI
                        </span>
                    </div>
                </div>

                {children}
            </main>
        </div>
    );
}
