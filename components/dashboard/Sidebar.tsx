"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useUser } from "@/components/providers/UserProvider";

interface SidebarProps {
    isMobileMenuOpen: boolean;
    onOpenSettings?: () => void;
}

export default function Sidebar({ isMobileMenuOpen, onOpenSettings }: SidebarProps) {
    const pathname = usePathname();
    const sidebarRef = useRef<HTMLElement>(null);
    const { user, stats } = useUser();

    // GSAP Entry Animation for Desktop
    useEffect(() => {
        // Only run initial animation on desktop to avoid conflicting with mobile transition
        if (window.innerWidth >= 1024) {
            gsap.fromTo(
                sidebarRef.current,
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
        }
    }, []);

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: "📊" },
        { name: "Upload & Analyze", href: "/dashboard/upload", icon: "📤" },
        { name: "Saved Reports", href: "/dashboard/reports", icon: "📑", disabled: true },
        { name: "Settings", href: "#", icon: "⚙️", onClick: onOpenSettings },
    ];

    return (
        <aside
            ref={sidebarRef}
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface/90 backdrop-blur-xl border-r border-border shadow-2xl shadow-violet-100/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
        >
            <div className="flex h-full flex-col p-6">
                <div className="mb-8 flex items-center gap-3 px-2 mt-2 lg:mt-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/30">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-6 w-6"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        DocuVision
                    </span>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const isSettings = item.name === "Settings";

                        if (isSettings) {
                            return (
                                <button
                                    key={item.name}
                                    onClick={item.onClick}
                                    className="w-full group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 text-muted hover:bg-background hover:text-violet-600"
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.name}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.disabled ? "#" : item.href}
                                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${item.disabled
                                    ? "cursor-not-allowed opacity-50"
                                    : isActive
                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                                        : "text-muted hover:bg-background hover:text-violet-600"
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.name}
                                {!item.disabled && isActive && (
                                    <span className="absolute right-3 h-2 w-2 rounded-full bg-white/30" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Real-time System Status */}
                <div className="mb-4 px-4 py-3 rounded-xl bg-background border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted">System Status</span>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted">Live Users</span>
                            <span className="font-mono font-medium text-foreground">{stats.onlineUsers}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted">Usage</span>
                            <span className="font-mono font-medium text-foreground">{stats.usagePercent.toFixed(1)}%</span>
                        </div>
                        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                            <div
                                className="h-full bg-violet-500 transition-all duration-1000 ease-in-out"
                                style={{ width: `${stats.usagePercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* User Profile */}
                <div className="mt-auto rounded-2xl bg-gradient-to-br from-violet-500/10 to-background p-4 border border-violet-500/20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold border-2 border-white shadow-sm">
                            {user.avatar}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-bold text-foreground">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-violet-600 font-medium">
                                {user.plan}
                            </p>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
