"use client";

import {
    LayoutDashboard,
    Search,
    History,
    Wallet,
    MessageSquare,
    LogOut,
    Star,
    Briefcase
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigationItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/onboarding/dashboard",
    },
    {
        title: "Browse Projects",
        icon: Briefcase,
        href: "/projects",
    },
    {
        title: "Task History",
        icon: History,
        href: "/history",
    },
    {
        title: "Reviews",
        icon: Star,
        href: "/reviews",
    },
    {
        title: "Wallet",
        icon: Wallet,
        href: "/wallet",
    },
    {
        title: "Messages",
        icon: MessageSquare,
        href: "/messages",
    },
    {
        title: "Profile",
        icon: Star,
        href: "/profile",
    },
];

export function FreelancerSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-full bg-white flex flex-col h-full">
            <nav className="flex-1 px-4 py-8">
                <ul className="space-y-4">
                    <div className="px-4 mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Freelancer Menu
                        </span>
                    </div>
                    {navigationItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.title}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-2 text-sm font-medium rounded-xl transition-all",
                                        isActive
                                            ? "bg-indigo-50 text-indigo-600 shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-gray-400")} />
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="px-6 py-8 border-t border-gray-100">
                <button className="flex items-center gap-4 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl w-full transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
