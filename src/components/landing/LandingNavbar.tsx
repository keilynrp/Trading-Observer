"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Menu, X, ArrowRight, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export function LandingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = () => {
        signOut({ callbackUrl: "/" });
    };

    const userRole = session?.user?.role;
    const isAdmin = userRole === "admin";

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
            isScrolled ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 py-3" : "bg-transparent py-6"
        )}>
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <TrendingUp className="text-white" size={24} />
                    </div>
                    <span className="font-bold text-2xl text-white tracking-tight">TradingLab</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-8">
                    {["Markets", "Features", "Community", "Pricing"].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            {item}
                        </Link>
                    ))}
                </div>

                {/* Desktop Auth Section */}
                <div className="hidden lg:flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700"
                            >
                                {session.user?.avatar && !session.user.avatar.startsWith("data:") ? (
                                    <Image
                                        src={session.user.avatar}
                                        alt={session.user?.name || "User"}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                        <User size={16} className="text-white" />
                                    </div>
                                )}
                                <span className="text-white font-medium">{session.user?.name}</span>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 animate-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-2 border-b border-slate-800">
                                        <p className="text-sm text-slate-400">Signed in as</p>
                                        <p className="text-white font-medium truncate">{session.user?.email}</p>
                                        {userRole && (
                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30 capitalize">
                                                {userRole}
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <LayoutDashboard size={16} />
                                        Dashboard
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            href="/dashboard/settings"
                                            className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <Settings size={16} />
                                            Settings
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-slate-800 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" className="text-white hover:bg-slate-800 font-bold">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 group">
                                    Start Trading
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden text-white p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-800 p-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-4">
                        {["Markets", "Features", "Community", "Pricing"].map((item) => (
                            <Link
                                key={item}
                                href="#"
                                className="text-lg font-medium text-slate-300 hover:text-white"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}
                        <hr className="border-slate-800 my-2" />
                        {isAuthenticated ? (
                            <>
                                <div className="px-4 py-2 bg-slate-800/50 rounded-lg">
                                    <p className="text-sm text-slate-400">Signed in as</p>
                                    <p className="text-white font-medium">{session.user?.name}</p>
                                    {userRole && (
                                        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-600/20 text-blue-400 capitalize">
                                            {userRole}
                                        </span>
                                    )}
                                </div>
                                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full border-slate-700 text-white bg-transparent">
                                        <LayoutDashboard size={16} className="mr-2" />
                                        Dashboard
                                    </Button>
                                </Link>
                                {isAdmin && (
                                    <Link href="/dashboard/settings" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full border-slate-700 text-white bg-transparent">
                                            <Settings size={16} className="mr-2" />
                                            Settings
                                        </Button>
                                    </Link>
                                )}
                                <Button onClick={handleSignOut} variant="outline" className="w-full border-red-700 text-red-400">
                                    <LogOut size={16} className="mr-2" />
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full border-slate-700 text-white bg-transparent">Log in</Button>
                                </Link>
                                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full bg-blue-600">Start Trading</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
