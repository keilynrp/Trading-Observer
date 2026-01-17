"use client";

import React, { useState, useEffect, memo } from "react";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    TrendingUp,
    Settings,
    Bell,
    ChevronLeft,
    Search,
    User,
    Menu,
    Eye,
    TrendingDown,
    Activity,
    PieChart,
    Newspaper,
    Sun,
    Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import Link from "next/link";
import { useSocket } from "@/components/providers/socket-provider";
import { usePermissions } from "@/components/providers/permission-provider";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { socket } = useSocket();
    const { currentUser, allUsers, switchUser, hasPermission, isLoading: permissionsLoading } = usePermissions();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { setTheme, resolvedTheme } = useTheme();
    const pathname = usePathname();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (n: any) => {
            setNotifications(prev => [n, ...prev].slice(0, 20));
            setUnreadCount(prev => prev + 1);
        };

        socket.on("dashboardNotification", handleNotification);
        return () => {
            socket.off("dashboardNotification", handleNotification);
        };
    }, [socket]);

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
        if (!isNotificationsOpen) {
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        setIsMobileMenuOpen(false); // Close mobile menu on route change
        setIsNotificationsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profile");
                const data = await res.json();
                setProfile(data);
            } catch (error) {
                console.error("Failed to load profile:", error);
            }
        };
        fetchProfile();
    }, []); // Only fetch on mount

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/" },
        { icon: <PieChart size={20} />, label: "Market", href: "/market" },
        { icon: <TrendingUp size={20} />, label: "Watchlist", href: "/watchlist" },
        { icon: <Bell size={20} />, label: "Alerts", href: "/alerts" },
        { icon: <Newspaper size={20} />, label: "News", href: "/news" },
        { icon: <User size={20} />, label: "Profile", href: "/profile" },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className={cn(
                "border-r bg-card flex flex-col transition-all duration-300 ease-in-out hidden md:flex relative",
                isCollapsed ? "w-20" : "w-64"
            )}>
                <Link href="/" className={cn(
                    "p-6 flex items-center gap-2 mb-4 overflow-hidden h-20 shrink-0 hover:opacity-80 transition-opacity",
                    isCollapsed ? "justify-center px-0" : "px-6"
                )}>
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <TrendingUp className="text-primary-foreground" size={20} />
                    </div>
                    {!isCollapsed && (
                        <span className="font-bold text-xl tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
                            TradingLab
                        </span>
                    )}
                </Link>

                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-16 w-6 h-6 rounded-full border bg-card flex items-center justify-center hover:bg-accent transition-colors z-50 shadow-sm"
                >
                    <ChevronLeft size={14} className={cn("transition-transform duration-300", isCollapsed ? "rotate-180" : "")} />
                </button>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.href}
                            icon={item.icon}
                            label={item.label}
                            href={item.href}
                            active={pathname === item.href}
                            collapsed={isCollapsed}
                        />
                    ))}
                </nav>

                <div className="p-3 border-t">
                    {hasPermission("edit_settings") && (
                        <NavItem
                            icon={<Settings size={20} />}
                            label="Settings"
                            href="/settings"
                            active={pathname === "/settings"}
                            collapsed={isCollapsed}
                        />
                    )}
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <aside
                        className="w-72 h-full bg-card border-r flex flex-col animate-in slide-in-from-left duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="text-primary" size={24} />
                                <span className="font-bold text-xl">TradingLab</span>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(false)}>
                                <ChevronLeft size={20} />
                            </Button>
                        </div>
                        <nav className="flex-1 p-4 space-y-2">
                            {navItems.map((item) => (
                                <NavItem
                                    key={item.href}
                                    icon={item.icon}
                                    label={item.label}
                                    href={item.href}
                                    active={pathname === item.href}
                                />
                            ))}
                            <div className="pt-4 mt-4 border-t">
                                {hasPermission("edit_settings") && (
                                    <NavItem
                                        icon={<Settings size={20} />}
                                        label="Settings"
                                        href="/settings"
                                        active={pathname === "/settings"}
                                    />
                                )}
                            </div>
                        </nav>
                        <div className="p-6 border-t bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                    {currentUser?.username?.[0].toUpperCase() || "T"}
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{currentUser?.username || "Trader"}</p>
                                    <p className="text-xs text-muted-foreground">{currentUser?.email || "trader@example.com"}</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b flex items-center justify-between px-4 md:px-8 bg-card/50 backdrop-blur-sm z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </Button>
                        <div className="flex items-center gap-4 bg-muted/50 px-3 py-1.5 rounded-full border hidden lg:flex">
                            <Search size={16} className="text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search assets..."
                                className="bg-transparent border-none focus:outline-none text-sm w-48 lg:w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* User Switcher (Simulated Session) */}
                        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border/50 mr-2">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground px-2">Role:</span>
                            <select
                                value={currentUser?.id || ""}
                                onChange={(e) => switchUser(e.target.value)}
                                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
                            >
                                {allUsers.map(u => (
                                    <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col items-end mr-4 hidden sm:flex">
                            <span className="text-xs text-muted-foreground">Welcome back,</span>
                            <span className="text-sm font-bold">{currentUser?.username || "Trader"}</span>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full"
                            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                        >
                            {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        </Button>

                        <div className="relative">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-full relative"
                                onClick={toggleNotifications}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white animate-in zoom-in duration-300">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </Button>

                            {/* Notifications Dropdown */}
                            {isNotificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-card border rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in duration-200">
                                    <div className="p-4 border-b flex items-center justify-between">
                                        <h3 className="font-bold">Notifications</h3>
                                        <button
                                            onClick={() => setNotifications([])}
                                            className="text-xs text-muted-foreground hover:text-primary"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-muted-foreground text-sm">
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div key={n.id} className="p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-default">
                                                    <div className="flex gap-3">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                                            n.type === 'volatility' ? "bg-red-500/10 text-red-500" :
                                                                n.type === 'trend' ? "bg-green-500/10 text-green-500" :
                                                                    n.type === 'news' ? "bg-blue-500/10 text-blue-500" :
                                                                        "bg-orange-500/10 text-orange-500"
                                                        )}>
                                                            {n.type === 'volatility' && <TrendingUp size={14} />}
                                                            {n.type === 'trend' && <TrendingUp size={14} />}
                                                            {n.type === 'news' && <Newspaper size={14} />}
                                                            {n.type === 'position' && <PieChart size={14} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold truncate">{n.title}</p>
                                                            <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                                {new Date(n.timestamp).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link href="/profile">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent overflow-hidden border-2 border-primary/20 hover:border-primary transition-all flex items-center justify-center">
                                {currentUser?.avatar ? (
                                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white text-[10px] font-bold">
                                        {currentUser?.username?.substring(0, 2).toUpperCase() || "TR"}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page Area */}
                <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};

const NavItem = memo(({ icon, label, href, active = false, collapsed = false }: { icon: React.ReactNode; label: string; href: string; active?: boolean; collapsed?: boolean }) => (
    <Link href={href}>
        <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all relative group",
            active ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0"
        )}>
            <div className="shrink-0">{icon}</div>
            {!collapsed ? (
                <span className="font-medium animate-in fade-in slide-in-from-left-2 duration-300">
                    {label}
                </span>
            ) : (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
                    {label}
                </div>
            )}
        </div>
    </Link>
));

NavItem.displayName = "NavItem";
