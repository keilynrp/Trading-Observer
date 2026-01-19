"use client";

import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { TickerTape } from "@/components/landing/TickerTape";
import { HeroSection } from "@/components/landing/HeroSection";
import { Features } from "@/components/landing/Features";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 selection:bg-blue-500/30">
            <LandingNavbar />

            <main>
                {/* Ticker Tape positioned right under navbar when scrolled or at very top */}
                <div className="pt-20 lg:pt-24">
                    <TickerTape />
                </div>

                <HeroSection />

                <Features />

                {/* Social Proof / Trusted Section */}
                <section className="py-20 border-y border-slate-900 bg-slate-950/50">
                    <div className="container mx-auto px-4">
                        <div className="text-center grayscale opacity-40 flex flex-wrap justify-center items-center gap-12 lg:gap-24">
                            <span className="text-2xl font-bold text-white tracking-widest">BINANCE</span>
                            <span className="text-2xl font-bold text-white tracking-widest">COINBASE</span>
                            <span className="text-2xl font-bold text-white tracking-widest">NASDAQ</span>
                            <span className="text-2xl font-bold text-white tracking-widest">BLOOMBERG</span>
                            <span className="text-2xl font-bold text-white tracking-widest">REUTERS</span>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 relative overflow-hidden bg-blue-600">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[40px] border-white rounded-full" />
                    </div>

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Ready to transform your trading?</h2>
                        <p className="text-blue-100 mb-10 text-lg max-w-2xl mx-auto">
                            Join thousands of traders who use TradingLab to gain a competitive edge in the markets.
                        </p>
                        <button className="h-16 px-12 bg-white text-blue-600 font-bold text-xl rounded-2xl hover:scale-105 transition-transform shadow-2xl">
                            Create Your Free Account
                        </button>
                    </div>
                </section>
            </main>

            <footer className="py-12 bg-slate-950 border-t border-slate-900">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <div className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white">TradingLab</span>
                    </div>

                    <div className="text-slate-500 text-sm">
                        © 2026 TradingLab. All rights reserved. Built for visionaries.
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-slate-500 hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="text-slate-500 hover:text-white transition-colors">Discord</a>
                        <a href="#" className="text-slate-500 hover:text-white transition-colors">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
