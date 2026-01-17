"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, TrendingDown, Activity, DollarSign, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { AnalysisChart } from "./AnalysisChart";
import { MarketSummary } from "./MarketSummary";

export function MarketDashboard() {
    const [symbol, setSymbol] = useState("AAPL");
    const [searchQuery, setSearchQuery] = useState("");
    const [marketData, setMarketData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMarketData = async (ticker: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/market?symbol=${ticker}`);
            const data = await res.json();
            if (res.ok) {
                setMarketData(data);
                setSymbol(ticker);
            } else {
                toast.error(data.error || "Failed to fetch data");
            }
        } catch (error) {
            toast.error("An error occurred while fetching data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData(symbol);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            fetchMarketData(searchQuery.toUpperCase());
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Market Observer</h1>
                    <p className="text-muted-foreground">Analysing global goods and technical indicators.</p>
                </div>

                <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search ticker (e.g. AAPL, BTC, IBM)"
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "..." : "Analyze"}
                    </Button>
                </form>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-background to-secondary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Symbol</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{marketData?.symbol || symbol}</div>
                        <p className="text-xs text-muted-foreground">Global Market Identifier</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-background to-secondary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Price</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${parseFloat(marketData?.price).toLocaleString() || "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">Latest Trading Price</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-background to-secondary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Change %</CardTitle>
                        {parseFloat(marketData?.changePercent) >= 0 ?
                            <TrendingUp className="h-4 w-4 text-emerald-500" /> :
                            <TrendingDown className="h-4 w-4 text-rose-500" />
                        }
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${parseFloat(marketData?.changePercent) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {marketData?.changePercent || "0.00%"}
                        </div>
                        <p className="text-xs text-muted-foreground">Relative Price Movement</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-background to-secondary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{marketData?.latestTradingDay || "N/A"}</div>
                        <p className="text-xs text-muted-foreground">Daily Trading Session</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4">
                    <CardHeader>
                        <CardTitle>Price Chart Analysis</CardTitle>
                        <CardDescription>Historical price movement and technical overlays for {symbol}.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 h-[400px]">
                        <AnalysisChart symbol={symbol} />
                    </CardContent>
                </Card>
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Technical Summary</CardTitle>
                        <CardDescription>AI-driven technical indicator analysis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MarketSummary symbol={symbol} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
