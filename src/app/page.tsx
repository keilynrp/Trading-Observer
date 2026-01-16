"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";
import { CandlestickChart } from "@/components/charts/candlestick-chart";
import { NewsPanel } from "@/components/dashboard/news-panel";
import { AlertManager } from "@/components/dashboard/alert-manager";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DashboardPage() {
    const { socket, isConnected } = useSocket();
    const [prices, setPrices] = useState<any>({});
    const [selectedSymbol, setSelectedSymbol] = useState("AAPL");

    useEffect(() => {
        if (!socket) return;

        // Subscribe to some initial tickers
        const initialTickers = ["AAPL", "BTC", "ETH", "TSLA"];
        initialTickers.forEach(ticker => socket.emit("subscribe", ticker));

        socket.on("priceUpdate", (data) => {
            setPrices((prev: any) => ({
                ...prev,
                [data.symbol]: data
            }));
        });

        socket.on("dashboardNotification", (n) => {
            // Only toast if it's within the last 10 seconds (prevents history spam)
            const isNew = (Date.now() - new Date(n.timestamp).getTime()) < 10000;

            if (isNew) {
                const icons: Record<string, any> = {
                    volatility: <Activity className="text-red-500" size={16} />,
                    trend: <TrendingUp className="text-green-500" size={16} />,
                    news: <Activity className="text-blue-500" size={16} />,
                    position: <PieChart className="text-orange-500" size={16} />,
                };

                toast(n.title, {
                    description: n.message,
                    icon: icons[n.type] || <Activity size={16} />,
                    duration: 5000,
                });
            }
        });

        return () => {
            initialTickers.forEach(ticker => socket.emit("unsubscribe", ticker));
            socket.off("priceUpdate");
            socket.off("dashboardNotification");
        };
    }, [socket]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
                    <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm text-muted-foreground">
                        {isConnected ? 'Live Market Feed' : 'Connecting...'}
                    </span>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Portfolio"
                    value="$124,562.80"
                    change="+12.5%"
                    trend="up"
                    themeColor="blue"
                    icon={<DollarSign size={20} />}
                />
                <StatCard
                    title="24h P&L"
                    value="+$3,450.20"
                    change="+2.8%"
                    trend="up"
                    themeColor="green"
                    icon={<TrendingUp size={20} />}
                />
                <StatCard
                    title="Active Positions"
                    value="12"
                    change="0"
                    trend="neutral"
                    themeColor="orange"
                    icon={<Activity size={20} />}
                />
                <StatCard
                    title="Market Sentiment"
                    value="Bullish"
                    change="High"
                    trend="up"
                    themeColor="purple"
                    icon={<PieChart size={20} />}
                />
            </div>

            {/* Real-time Tickers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="p-6 bg-card/40 backdrop-blur-md border">
                        <CandlestickChart symbol={selectedSymbol} />
                    </Card>
                </div>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Live Watchlist</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.values(prices).length > 0 ? (
                            Object.values(prices).map((asset: any) => (
                                <TickerRow
                                    key={asset.symbol}
                                    asset={asset}
                                    isActive={selectedSymbol === asset.symbol}
                                    onClick={() => setSelectedSymbol(asset.symbol)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No active subscriptions
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Area: News & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <NewsPanel />
                <AlertManager />
            </div>
        </div>
    );
}

const StatCard = React.memo(({ title, value, change, trend, icon, themeColor }: any) => {
    const colorMap: Record<string, string> = {
        blue: "text-blue-500",
        green: "text-green-500",
        orange: "text-orange-500",
        purple: "text-purple-500",
    };

    return (
        <Card className="overflow-hidden relative group border">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <div className={cn("p-1.5 rounded-lg bg-muted/50", colorMap[themeColor] || "text-primary")}>
                        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 16 }) : icon}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className={`text-xs mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                    {trend === 'up' && <TrendingUp size={12} />}
                    {trend === 'down' && <TrendingDown size={12} />}
                    {change}
                    <span className="text-muted-foreground ml-1">from yesterday</span>
                </p>
            </CardContent>
        </Card>
    );
});

StatCard.displayName = "StatCard";

const TickerRow = React.memo(({ asset, isActive, onClick }: any) => {
    const isPositive = parseFloat(asset.change) >= 0;
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border",
                isActive
                    ? "bg-primary/10 border-primary/20 shadow-sm"
                    : "hover:bg-muted/50 border-transparent hover:border-border"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                    {asset.symbol}
                </div>
                <div>
                    <div className="font-bold">{asset.symbol}</div>
                    <div className="text-xs text-muted-foreground">Stock</div>
                </div>
            </div>
            <div className="text-right">
                <div className="font-mono font-bold">${asset.price}</div>
                <div className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{asset.changePercent}%
                </div>
            </div>
        </div>
    );
});

TickerRow.displayName = "TickerRow";
