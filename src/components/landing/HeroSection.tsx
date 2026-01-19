"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-950">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/20 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <TrendingUp size={14} />
                    <span>v2.0 is now live: Enhanced Social Watchlists</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
                    Observe. Analyze. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Outperform.</span>
                </h1>

                <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    The all-in-one market observatory for visionary traders. Track real-time data, build social watchlists, and stay ahead with AI-driven news intelligence.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Button size="lg" className="h-14 px-8 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 group">
                        Get Started Free
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold bg-slate-900/50 backdrop-blur-md border-slate-800 text-white hover:bg-slate-800 rounded-xl">
                        View Live Markets
                    </Button>
                </div>

                {/* Dashboard Preview MacMockup-style */}
                <div className="relative max-w-5xl mx-auto mt-12 animate-in fade-in zoom-in duration-1000">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-2xl shadow-2xl overflow-hidden p-2">
                        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-800 bg-slate-900/80">
                            <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                        </div>
                        <div className="bg-slate-950/20">
                            <img
                                src="https://images.unsplash.com/photo-1611974717482-58a00f24835a?auto=format&fit=crop&q=80&w=2070"
                                alt="Dashboard Preview"
                                className="w-full h-auto rounded-b-xl opacity-80"
                            />
                        </div>
                    </div>

                    {/* Floating Feature Cards */}
                    <div className="absolute -left-8 top-1/4 p-4 rounded-xl border border-blue-500/30 bg-blue-950/40 backdrop-blur-xl shadow-xl hidden lg:block animate-bounce-slow">
                        <Activity className="text-blue-400 mb-2" size={24} />
                        <div className="font-bold text-white text-sm">Real-time Feed</div>
                        <div className="text-[10px] text-blue-300/60">0.02ms latency</div>
                    </div>

                    <div className="absolute -right-8 bottom-1/4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 backdrop-blur-xl shadow-xl hidden lg:block animate-bounce-slow delay-700">
                        <Shield className="text-emerald-400 mb-2" size={24} />
                        <div className="font-bold text-white text-sm">Secure Assets</div>
                        <div className="text-[10px] text-emerald-300/60">Encrypted data</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
