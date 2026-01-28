"use client";

import React, { useState, useEffect } from 'react';
import { Search, Brain, TrendingUp, TrendingDown, Target, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ForecastingData {
    symbol: string;
    healthScore: number;
    recommendation: 'BUY' | 'SELL' | 'HOLD';
    signals: {
        trend: string;
        momentum: string;
        volatility: string;
    };
    advice: {
        when: string;
        how: string;
        why: string;
    };
    technicalData: {
        rsi: number;
        macd: number;
        sma: number;
        price: number;
    };
}

export default function ForecastingView() {
    const [symbol, setSymbol] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ForecastingData | null>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!symbol) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/forecasting?symbol=${symbol.trim().toUpperCase()}`);
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Error desconocido');
            }

            setData(result);
        } catch (error: any) {
            toast.error(`Error de Análisis: ${error.message}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 65) return 'text-green-500';
        if (score <= 35) return 'text-red-500';
        return 'text-yellow-500';
    };

    const getBgColor = (score: number) => {
        if (score >= 65) return 'bg-green-500/10 border-green-500/20';
        if (score <= 35) return 'bg-red-500/10 border-red-500/20';
        return 'bg-yellow-500/10 border-yellow-500/20';
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Análisis Predictivo</h1>
                <p className="text-muted-foreground">
                    Motor de inteligencia operativa para decisiones de inversión basadas en salud de mercado.
                </p>
            </header>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Ingresa ticker (ej: AAPL, BTC, NVDA)..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border bg-card focus:ring-2 focus:ring-primary focus:outline-none transition-all uppercase"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                    />
                </div>
                <Button type="submit" disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />}
                    Analizar
                </Button>
            </form>

            {!data && !loading && (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl bg-muted/20 opacity-60">
                    <Brain size={48} className="mb-4 text-primary" />
                    <p className="text-lg font-medium">Listo para analizar activos</p>
                    <p className="text-sm text-muted-foreground">Ingresa un símbolo arriba para comenzar el pronóstico técnico.</p>
                </div>
            )}

            {data && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Health Score Card */}
                    <div className={cn("md:col-span-1 border rounded-3xl p-8 flex flex-col items-center justify-center text-center", getBgColor(data.healthScore))}>
                        <span className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Salud de Mercado</span>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-muted/20"
                                />
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={364.4}
                                    strokeDashoffset={364.4 - (364.4 * data.healthScore) / 100}
                                    className={cn("transition-all duration-1000 ease-out", getScoreColor(data.healthScore))}
                                />
                            </svg>
                            <span className={cn("absolute text-4xl font-black", getScoreColor(data.healthScore))}>
                                {data.healthScore}
                            </span>
                        </div>
                        <div className="mt-6">
                            <h2 className={cn("text-2xl font-black mb-1", getScoreColor(data.healthScore))}>
                                {data.recommendation}
                            </h2>
                            <p className="text-sm font-medium opacity-80">Recomendación Sugerida</p>
                        </div>
                    </div>

                    {/* Advice Cards */}
                    <div className="md:col-span-2 space-y-4">
                        <section className="bg-card border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Target size={20} />
                                </div>
                                <h3 className="font-bold text-lg">¿Cuándo invertir?</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {data.advice.when}
                            </p>
                        </section>

                        <section className="bg-card border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="font-bold text-lg">¿Cómo invertir?</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {data.advice.how}
                            </p>
                        </section>

                        <section className="bg-card border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <HelpCircle size={20} />
                                </div>
                                <h3 className="font-bold text-lg">¿Por qué invertir?</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {data.advice.why}
                            </p>
                        </section>
                    </div>

                    {/* Technical Indicators */}
                    <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <IndicatorItem
                            label="RSI (14)"
                            value={data.technicalData.rsi ? data.technicalData.rsi.toFixed(2) : '--'}
                            status={data.technicalData.rsi > 70 ? 'BEARISH' : data.technicalData.rsi < 30 ? 'BULLISH' : 'NEUTRAL'}
                        />
                        <IndicatorItem
                            label="MACD"
                            value={data.technicalData.macd ? data.technicalData.macd.toFixed(4) : '--'}
                            status={data.technicalData.macd > 0 ? 'BULLISH' : 'BEARISH'}
                        />
                        <IndicatorItem
                            label="SMA (20)"
                            value={data.technicalData.sma ? `$${data.technicalData.sma.toFixed(2)}` : '--'}
                            status={data.technicalData.price > data.technicalData.sma ? 'BULLISH' : 'BEARISH'}
                        />
                        <IndicatorItem
                            label="Precio Actual"
                            value={data.technicalData.price ? `$${data.technicalData.price.toFixed(2)}` : '--'}
                            status="NEUTRAL"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function IndicatorItem({ label, value, status }: { label: string; value: string; status: string }) {
    return (
        <div className="bg-card border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-xs uppercase font-bold text-muted-foreground mb-1">{label}</span>
            <span className="text-xl font-bold mb-2">{value}</span>
            <div className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                status === 'BULLISH' ? "bg-green-500/10 text-green-500" :
                    status === 'BEARISH' ? "bg-red-500/10 text-red-500" :
                        "bg-muted text-muted-foreground"
            )}>
                {status}
            </div>
        </div>
    )
}
