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
        <div className="flex h-screen bg-gray-50">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-base font-bold text-gray-900">
                            KTU Exam Prep
                        </span>
                    </div>
                    <button
                        onClick={closeSidebar}
                        className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="px-5 py-4">
                    <NewChatButton onNavigate={closeSidebar} />
                </div>

                {/* Navigation Links */}
                <div className="px-3">
                    <NavigationLinks onNavigate={closeSidebar} />
                </div>

                {/* Divider */}
                <hr className="mx-5 my-2 border-gray-100" />

                {/* Recent Chats (scrollable, takes remaining space) */}
                <RecentChats onNavigate={closeSidebar} />

                {/* Divider */}
                <hr className="mx-5 border-gray-100" />

                {/* User Profile (fixed bottom) */}
                <div className="px-3 py-2">
                    <UserProfile />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center h-14 px-4 bg-white border-b border-gray-200">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg -ml-2"
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2 ml-3">
                        <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                            KTU Exam Prep
                        </span>
                    </div>
                </div>

                {children}
            </main>
        </div>
    );
}
