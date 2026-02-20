"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
    { href: "/patterns", label: "Patterns", icon: BarChart3 },
    { href: "/courses", label: "Courses", icon: BookOpen },
];

interface NavigationLinksProps {
    onNavigate?: () => void;
}

export function NavigationLinks({ onNavigate }: NavigationLinksProps) {
    const pathname = usePathname();

    return (
        <nav className="space-y-1">
            {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={onNavigate}
                        className={cn(
                            "flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-150",
                            isActive
                                ? "bg-sidebar-surface text-sidebar-text"
                                : "text-sidebar-text-secondary hover:bg-sidebar-hover hover:text-sidebar-text"
                        )}
                    >
                        <link.icon className="w-5 h-5 shrink-0" />
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
