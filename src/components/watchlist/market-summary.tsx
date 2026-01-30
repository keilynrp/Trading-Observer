import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

interface MarketSummaryProps {
    portfolioValue: number;
    portfolioChange: number;
    portfolioChangePercent: number;
    activeStocks: number;
    gainers: number;
    losers: number;
}

export function MarketSummary({
    portfolioValue,
    portfolioChange,
    portfolioChangePercent,
    activeStocks,
    gainers,
    losers
}: MarketSummaryProps) {
    const isPositive = portfolioChange >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <div className={`text-xs font-bold flex items-center mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                        {isPositive ? '+' : ''}{portfolioChange} ({portfolioChangePercent}%)
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Stocks</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeStocks}</div>
                    <p className="text-xs text-muted-foreground mt-1">Currently tracking</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Gainers</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">{gainers}</div>
                    <p className="text-xs text-muted-foreground mt-1">Stocks up today</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Losers</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-500">{losers}</div>
                    <p className="text-xs text-muted-foreground mt-1">Stocks down today</p>
                </CardContent>
            </Card>
        </div>
    );
}
