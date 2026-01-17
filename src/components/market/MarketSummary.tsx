"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpCircle, ArrowDownCircle, Info } from "lucide-react";

export function MarketSummary({ symbol }: { symbol: string }) {
    const [indicators, setIndicators] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchIndicators = async () => {
            setIsLoading(true);
            try {
                // Fetch SMA and RSI in parallel
                const [smaRes, rsiRes] = await Promise.all([
                    fetch(`/api/market?function=SMA&symbol=${symbol}`),
                    fetch(`/api/market?function=RSI&symbol=${symbol}`)
                ]);

                const smaData = await smaRes.json();
                const rsiData = await rsiRes.json();

                const latestSmaEntry = smaData["Technical Analysis: SMA"] ? Object.entries(smaData["Technical Analysis: SMA"])[0] : null;
                const latestRsiEntry = rsiData["Technical Analysis: RSI"] ? Object.entries(rsiData["Technical Analysis: RSI"])[0] : null;

                setIndicators({
                    sma: latestSmaEntry ? parseFloat((latestSmaEntry[1] as any)["SMA"]) : null,
                    rsi: latestRsiEntry ? parseFloat((latestRsiEntry[1] as any)["RSI"]) : null,
                    date: latestSmaEntry ? latestSmaEntry[0] : "N/A"
                });
            } catch (error) {
                console.error("Failed to fetch indicators", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchIndicators();
    }, [symbol]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    if (!indicators) {
        return <div className="text-muted-foreground italic">Indicators not available for this ticker.</div>;
    }

    const isBullish = indicators.rsi ? indicators.rsi > 50 : false;
    const isOverbought = indicators.rsi ? indicators.rsi > 70 : false;
    const isOversold = indicators.rsi ? indicators.rsi < 30 : false;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30 border border-primary/10">
                    <div className="text-xs font-medium text-muted-foreground uppercase">SMA (20)</div>
                    <div className="text-xl font-bold">${indicators.sma?.toFixed(2) || "N/A"}</div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 border border-primary/10">
                    <div className="text-xs font-medium text-muted-foreground uppercase">RSI (14)</div>
                    <div className="text-xl font-bold">{indicators.rsi?.toFixed(2) || "N/A"}</div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    Market Sentiment Analysis
                </div>

                <div className="grid gap-3">
                    {isBullish ? (
                        <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/20 flex gap-4 items-start">
                            <ArrowUpCircle className="h-6 w-6 text-emerald-500 mt-1" />
                            <div>
                                <div className="font-bold text-emerald-500">Bullish Momentum</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    RSI is above 50 and price is holding steady. Positive trend confirmed for {symbol}.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl border bg-rose-500/5 border-rose-500/20 flex gap-4 items-start">
                            <ArrowDownCircle className="h-6 w-6 text-rose-500 mt-1" />
                            <div>
                                <div className="font-bold text-rose-500">Bearish Pressure</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Indicators suggest a slowdown in momentum. Caution advised for {symbol}.
                                </p>
                            </div>
                        </div>
                    )}

                    {isOverbought && (
                        <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/20 flex gap-4 items-start">
                            <Info className="h-6 w-6 text-amber-500 mt-1" />
                            <div>
                                <div className="font-bold text-amber-500">Overbought Alert</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    RSI is above 70, indicating potential exhaustion and a possible pullback.
                                </p>
                            </div>
                        </div>
                    )}

                    {isOversold && (
                        <div className="p-4 rounded-xl border bg-blue-500/5 border-blue-500/20 flex gap-4 items-start">
                            <Activity className="h-6 w-6 text-blue-500 mt-1" />
                            <div>
                                <div className="font-bold text-blue-500">Oversold Opportunity</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    RSI is below 30, suggesting the asset may be undervalued in the short term.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="text-[10px] text-center text-muted-foreground italic">
                Data analyzed for period ending: {indicators.date}
            </div>
        </div>
    );
}

import { Activity } from "lucide-react";
