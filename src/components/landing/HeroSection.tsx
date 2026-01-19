"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export function HeroSection() {
    const { status } = useSession();
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-950">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/hero-bg.jpg"
                    alt="Trading Background"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950" />
            </div>

            {/* Background Gradients (Accent) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/20 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">

                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
                    Observe. Analyze. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Outperform.</span>
                </h1>

                <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    The all-in-one market observatory for visionary traders. Track real-time data, build social watchlists, and stay ahead with AI-driven news intelligence.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Link href={status === "authenticated" ? "/dashboard" : "/register"}>
                        <Button size="lg" className="h-14 px-8 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 group">
                            {status === "authenticated" ? "Go to Dashboard" : "Get Started Free"}
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold bg-slate-900/50 backdrop-blur-md border-slate-800 text-white hover:bg-slate-800 rounded-xl">
                            View Live Markets
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
