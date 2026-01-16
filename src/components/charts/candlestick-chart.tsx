"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";

interface CandlestickData {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
}

import { useTheme } from "@/components/providers/theme-provider";

export const CandlestickChart = ({ symbol = "AAPL" }: { symbol?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<CandlestickData[]>([]);
    const [timeframe, setTimeframe] = useState("1m");
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        // Multiplier based on timeframe to simulate different look and feel
        const multiplierMap: Record<string, number> = {
            "1m": 1,
            "5m": 5,
            "15m": 15,
            "1h": 60,
            "1d": 1440
        };
        const multiplier = multiplierMap[timeframe] || 1;

        // Generate mock historical data
        const mockData: CandlestickData[] = [];
        let price = symbol === "BTC" ? 95000 : symbol === "ETH" ? 2500 : 150;
        const now = new Date();

        for (let i = 0; i < 50; i++) {
            const date = new Date(now.getTime() - (50 - i) * multiplier * 60000);
            const volatility = price * 0.005;
            const open = price + (Math.random() - 0.5) * volatility;
            const close = open + (Math.random() - 0.5) * volatility;
            const high = Math.max(open, close) + Math.random() * (volatility / 2);
            const low = Math.min(open, close) - Math.random() * (volatility / 2);
            mockData.push({ date, open, high, low, close });
            price = close;
        }
        setData(mockData);
    }, [symbol, timeframe]);

    useEffect(() => {
        if (!containerRef.current || data.length === 0) return;

        // Clear previous chart
        d3.select(containerRef.current).selectAll("*").remove();

        // Get colors from CSS variables
        const style = getComputedStyle(document.documentElement);
        const borderColor = `hsl(${style.getPropertyValue("--border")})`;
        const mutedTextColor = `hsl(${style.getPropertyValue("--muted-foreground")})`;

        const margin = { top: 20, right: 50, bottom: 30, left: 50 };
        const width = containerRef.current.clientWidth - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(containerRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.date.toISOString()))
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([
                (d3.min(data, d => d.low) || 0) * 0.999,
                (d3.max(data, d => d.high) || 0) * 1.001
            ])
            .nice()
            .range([height, 0]);

        // Axes
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x)
                .tickValues(x.domain().filter((_, i) => !(i % 10)))
                .tickFormat(d => d3.timeFormat(timeframe === "1d" ? "%b %d" : "%H:%M")(new Date(d))))
            .attr("color", mutedTextColor);

        svg.append("g")
            .attr("transform", `translate(${width},0)`)
            .call(d3.axisRight(y))
            .attr("color", mutedTextColor);

        // Grid lines
        svg.append("g")
            .attr("class", "grid")
            .attr("stroke", borderColor)
            .attr("stroke-opacity", 0.1)
            .call(d3.axisLeft(y).tickSize(-width).tickFormat(() => ""));

        // Candlesticks
        const candles = svg.selectAll(".candle")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "candle");

        // Wicks
        candles.append("line")
            .attr("x1", d => (x(d.date.toISOString()) || 0) + x.bandwidth() / 2)
            .attr("x2", d => (x(d.date.toISOString()) || 0) + x.bandwidth() / 2)
            .attr("y1", d => y(d.high))
            .attr("y2", d => y(d.low))
            .attr("stroke", d => d.close > d.open ? "#22c55e" : "#ef4444")
            .attr("stroke-width", 1);

        // Bodies
        candles.append("rect")
            .attr("x", d => x(d.date.toISOString()) || 0)
            .attr("y", d => y(Math.max(d.open, d.close)))
            .attr("width", x.bandwidth())
            .attr("height", d => Math.max(1, Math.abs(y(d.open) - y(d.close))))
            .attr("fill", d => d.close > d.open ? "#22c55e" : "#ef4444")
            .attr("rx", 1);

    }, [data, timeframe, resolvedTheme]);

    const lastPrice = data.length > 0 ? data[data.length - 1].close : 0;
    const firstPrice = data.length > 0 ? data[0].open : 0;
    const priceChange = lastPrice - firstPrice;
    const percentChange = (priceChange / firstPrice) * 100;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <span className="text-xl font-bold uppercase">{symbol}</span>
                    <div className="flex bg-muted rounded-lg p-1 text-xs font-medium">
                        {["1m", "5m", "15m", "1h", "1d"].map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`px-3 py-1 rounded-md transition-all ${tf === timeframe ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-sm font-bold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        ({priceChange >= 0 ? "+" : ""}{percentChange.toFixed(2)}%)
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Historical {timeframe} View</div>
                </div>
            </div>
            <div ref={containerRef} className="w-full h-[400px] select-none" />
        </div>
    );
};
