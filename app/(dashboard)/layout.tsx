"use client";

import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { NewChatButton } from "@/components/sidebar/NewChatButton";
import { NavigationLinks } from "@/components/sidebar/NavigationLinks";
import { RecentChats } from "@/components/sidebar/RecentChats";
import { UserProfile } from "@/components/sidebar/UserProfile";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="flex h-screen bg-main-bg">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar - Dark Theme */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-sidebar-bg border-r border-sidebar-border flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-[60px] px-4 border-b border-sidebar-border">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-purple-500 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-base font-semibold text-sidebar-text tracking-tight">
                            KTU Exam Prep
                        </span>
                    </div>
                    <button
                        onClick={closeSidebar}
                        className="lg:hidden p-1.5 rounded-md text-sidebar-text-secondary hover:text-sidebar-text hover:bg-sidebar-hover transition-all duration-150"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="px-3 pt-4 pb-2">
                    <NewChatButton onNavigate={closeSidebar} />
                </div>

                {/* Navigation Links */}
                <div className="px-3 pb-2">
                    <NavigationLinks onNavigate={closeSidebar} />
                </div>

                {/* Divider */}
                <div className="mx-3 border-t border-sidebar-border" />

                {/* Recent Chats (scrollable, takes remaining space) */}
                <RecentChats onNavigate={closeSidebar} />

                {/* Divider */}
                <div className="mx-3 border-t border-sidebar-border" />

                {/* User Profile (fixed bottom) */}
                <div className="px-2 py-2">
                    <UserProfile />
                </div>
            </aside>

            {/* Main Content - Light Theme */}
            <main className="flex-1 flex flex-col min-w-0 bg-main-bg">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center h-14 px-4 bg-white border-b border-main-border">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-main-surface rounded-lg -ml-2 transition-colors duration-150"
                    >
                        <Menu className="w-5 h-5 text-main-text-secondary" />
                    </button>
                    <div className="flex items-center gap-2 ml-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-accent-blue to-purple-500 rounded-md flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-main-text">
                            KTU Exam Prep
                        </span>
                    </div>
                </div>

                {children}
            </main>
        </div>
    );
}
