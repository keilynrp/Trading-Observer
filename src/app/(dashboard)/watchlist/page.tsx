"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MarketSummary } from "@/components/watchlist/market-summary";
import { StockCard, StockData } from "@/components/watchlist/stock-card";
import { useSocket } from "@/components/providers/socket-provider";

// Basic Mock Generator for initial prices only
const generateMockData = (symbol: string, basePrice: number, name: string): StockData => {
    const changePercent = (Math.random() * 4) - 2; // -2% to +2%
    const change = basePrice * (changePercent / 100);

    return {
        symbol,
        name,
        price: basePrice,
        change,
        changePercent,
    };
};

// Initial Mock Dataset
const INITIAL_STOCKS: StockData[] = [
    generateMockData("AAPL", 188.17, "Apple Inc."),
    generateMockData("GOOGL", 136.06, "Alphabet Inc."),
    generateMockData("MSFT", 428.28, "Microsoft Corporation"),
    generateMockData("TSLA", 259.79, "Tesla Inc."),
    generateMockData("AMZN", 177.61, "Amazon.com Inc."),
    generateMockData("NVDA", 876.41, "NVIDIA Corporation"),
    generateMockData("META", 485.58, "Meta Platforms Inc."),
    generateMockData("AMD", 180.49, "Advanced Micro Devices")
];

export default function WatchlistPage() {
    const { socket } = useSocket();
    const [stocks, setStocks] = useState<StockData[]>(INITIAL_STOCKS);
    const [searchQuery, setSearchQuery] = useState("");

    // Socket subscription for live updates
    useEffect(() => {
        if (!socket) return;

        const symbols = stocks.map(s => s.symbol);
        symbols.forEach(symbol => socket.emit("subscribe", symbol));

        // Use a generic listener for any price update
        const handlePriceUpdate = (data: any) => {
            setStocks(prevStocks => prevStocks.map(stock => {
                if (stock.symbol === data.symbol && data.price) {
                    return {
                        ...stock,
                        price: data.price,
                        change: data.change || stock.change,
                        changePercent: data.changePercent || stock.changePercent
                    };
                }
                return stock;
            }));
        };

        socket.on("priceUpdate", handlePriceUpdate);

        return () => {
            symbols.forEach(symbol => socket.emit("unsubscribe", symbol));
            socket.off("priceUpdate", handlePriceUpdate);
        };
    }, [socket]); // Re-run if socket changes (connection)


    // Filter stocks based on search
    const filteredStocks = stocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Dynamic Summary Calculations
    const portfolioValue = 12847.65; // Static for demo as we don't hold qty yet
    const activeStocks = stocks.length;
    const gainers = stocks.filter(s => s.change >= 0).length;
    const losers = stocks.filter(s => s.change < 0).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">StockPredict</h1>
                    <p className="text-muted-foreground">AI-Powered Market Intelligence</p>
                </div>
            </div>

            {/* Market Summary Section */}
            <MarketSummary
                portfolioValue={portfolioValue}
                portfolioChange={156.42}
                portfolioChangePercent={1.23}
                activeStocks={activeStocks}
                gainers={gainers}
                losers={losers}
            />

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search stocks by symbol or name..."
                    className="pl-10 bg-muted/30 border-none shadow-sm h-12 text-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Stock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStocks.map(stock => (
                    <StockCard key={stock.symbol} data={stock} />
                ))}

                {filteredStocks.length === 0 && (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                        No stocks found matching "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    );
}
