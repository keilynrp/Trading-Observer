"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function LandingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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

                <div className="hidden lg:flex items-center gap-4">
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
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full border-slate-700 text-white bg-transparent">Log in</Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full bg-blue-600">Start Trading</Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
