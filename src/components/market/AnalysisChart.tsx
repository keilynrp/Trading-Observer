"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainerProps } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalysisChart({ symbol }: { symbol: string }) {
    const [priceData, setPriceData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [priceRes, rsiRes] = await Promise.all([
                    fetch(`/api/market?function=TIME_SERIES_DAILY&symbol=${symbol}`),
                    fetch(`/api/market?function=RSI&symbol=${symbol}`)
                ]);

                const priceJson = await priceRes.json();
                const rsiJson = await rsiRes.json();

                const timeSeries = priceJson["Time Series (Daily)"];
                const rsiSeries = rsiJson["Technical Analysis: RSI"];

                if (timeSeries) {
                    const chartData = Object.entries(timeSeries).slice(0, 30).map(([date, values]: [string, any]) => ({
                        date: date,
                        price: parseFloat(values["4. close"]),
                        rsi: rsiSeries && rsiSeries[date] ? parseFloat(rsiSeries[date]["RSI"]) : null
                    })).reverse();
                    setPriceData(chartData);
                }
            } catch (error) {
                console.error("Failed to fetch chart data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [symbol]);

    if (isLoading) {
        return <Skeleton className="w-full h-full rounded-xl" />;
    }

    if (priceData.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground italic">
                No historical data available for this asset.
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="date"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'currentColor', opacity: 0.5 }}
                            tickFormatter={(str) => str.split('-').slice(1).join('/')}
                        />
                        <YAxis
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'currentColor', opacity: 0.5 }}
                            domain={['auto', 'auto']}
                            tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="h-24 border-t pt-2">
                <div className="text-[10px] text-muted-foreground mb-1 uppercase font-bold px-4">RSI (14)</div>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '10px'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="rsi"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fill="#8b5cf6"
                            fillOpacity={0.1}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
