"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export function TickerTape() {
    const { socket } = useSocket();
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        if (!socket) return;

        const initialTickers = ["BTC", "ETH", "AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "AMZN"];
        initialTickers.forEach((ticker) => socket.emit("subscribe", ticker));

        const handleUpdate = (update: any) => {
            setData((prev) => {
                const index = prev.findIndex((item) => item.symbol === update.symbol);
                if (index > -1) {
                    const newData = [...prev];
                    newData[index] = update;
                    return newData;
                }
                return [...prev, update];
            });
        };

        socket.on("priceUpdate", handleUpdate);
        return () => {
            initialTickers.forEach((ticker) => socket.emit("unsubscribe", ticker));
            socket.off("priceUpdate", handleUpdate);
        };
    }, [socket]);

    return (
        <div className="w-full bg-slate-900 border-y border-slate-800 overflow-hidden h-10 flex items-center relative z-50">
            <div className="flex animate-marquee whitespace-nowrap gap-8 py-2">
                {/* Render twice for continuous loop */}
                {[...data, ...data].map((item, idx) => (
                    <div key={`${item.symbol}-${idx}`} className="flex items-center gap-2 px-4 border-r border-slate-800/50 last:border-0 h-6">
                        <span className="font-bold text-slate-200 text-xs">{item.symbol}</span>
                        <span className="font-mono text-slate-100 text-xs">${item.price}</span>
                        <span className={cn(
                            "text-[10px] font-bold flex items-center",
                            parseFloat(item.change) >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                            {parseFloat(item.change) >= 0 ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                            {item.changePercent}%
                        </span>
                    </div>
                ))}
                {data.length === 0 && (
                    <div className="text-slate-500 text-xs px-4">Initializing global market feed...</div>
                )}
            </div>
        </div>
    );
}
