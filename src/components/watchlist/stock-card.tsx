
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TradeDialog } from "./trade-dialog";

export interface StockData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

interface StockCardProps {
    data: StockData;
}

export function StockCard({ data }: StockCardProps) {
    const isPositive = data.change >= 0;

    // Prediction State
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Trade Dialog State
    const [tradeOpen, setTradeOpen] = useState(false);
    const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

    useEffect(() => {
        let mounted = true;

        const fetchPrediction = async () => {
            try {
                const res = await fetch(`/api/forecasting?symbol=${data.symbol}`);
                if (mounted) {
                    if (res.ok) {
                        const result = await res.json();
                        setPrediction(result);
                    } else {
                        setError(true);
                    }
                    setLoading(false);
                }
            } catch (e) {
                if (mounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchPrediction();

        return () => { mounted = false; };
    }, [data.symbol]);

    const handleTrade = (type: "buy" | "sell") => {
        setTradeType(type);
        setTradeOpen(true);
    };

    // Derived values from prediction or defaults
    const confidence = prediction?.healthScore || 0;
    const predLabel = prediction?.recommendation || "HOLD";
    const volume = prediction?.technicalData?.volume ? `${(parseInt(prediction.technicalData.volume) / 1000000).toFixed(2)}M` : "---";
    const peRatio = prediction?.technicalData?.peRatio || "---";

    const markerPosition = `${confidence}%`;

    const getPredictionColor = (pred: string) => {
        switch (pred) {
            case "BUY": return "bg-green-500";
            case "SELL": return "bg-red-500";
            default: return "bg-yellow-500";
        }
    };

    return (
        <>
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 flex flex-col justify-between h-full">
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg">{data.symbol}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{data.name}</p>
                        </div>
                        <Badge variant="secondary" className="bg-muted/50 text-xs font-normal gap-1 shrink-0">
                            <Activity size={10} className="animate-pulse text-primary" />
                            Live
                        </Badge>
                    </div>

                    {/* Price Section */}
                    <div className="mb-6">
                        <div className="text-3xl font-bold">
                            ${(data.price || 0).toFixed(2)}
                        </div>
                        <div className={cn("flex items-center text-sm font-medium mt-1", isPositive ? "text-green-500" : "text-red-500")}>
                            {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                            {isPositive ? '+' : ''}{(data.change || 0).toFixed(2)} ({(data.changePercent || 0).toFixed(2)}%)
                        </div>
                    </div>

                    {/* AI Prediction Section */}
                    <div className="mb-6 space-y-2 min-h-[100px]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                <Zap size={12} className="text-purple-500" />
                                AI Prediction
                            </span>
                            {!loading && !error && (
                                <Badge className={cn("text-[10px] h-5", getPredictionColor(predLabel))}>
                                    {predLabel}
                                </Badge>
                            )}
                        </div>

                        {loading && (
                            <div className="h-12 flex items-center justify-center">
                                <Loader2 className="animate-spin text-muted-foreground" size={16} />
                            </div>
                        )}

                        {error && (
                            <div className="h-12 flex items-center justify-center text-xs text-muted-foreground bg-muted/20 rounded">
                                Data Unavailable
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                {/* Prediction Bar */}
                                <div className="relative h-6 w-full">
                                    <div className="absolute inset-0 rounded-full overflow-hidden flex h-2 top-2">
                                        <div className="h-full bg-red-400 w-[35%] opacity-80" />
                                        <div className="h-full bg-yellow-400 w-[30%] opacity-80" />
                                        <div className="h-full bg-green-500 w-[35%] opacity-80" />
                                    </div>
                                    <div
                                        className="absolute top-0 w-1 h-6 bg-foreground rounded-full shadow-lg transform -translate-x-1/2 transition-all duration-500 z-10"
                                        style={{ left: markerPosition }}
                                    />
                                </div>

                                {/* Scale Labels */}
                                <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                                    <div className="text-left"><span className="block font-bold text-red-500">SELL</span>0-35</div>
                                    <div className="text-center"><span className="block font-bold text-yellow-500">HOLD</span>35-65</div>
                                    <div className="text-right"><span className="block font-bold text-green-500">BUY</span>65-100</div>
                                </div>

                                <div className="text-center mt-2">
                                    <span className="text-[10px] text-muted-foreground">
                                        {confidence}/100 confidence
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed mb-4">
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Volume</p>
                            <p className="text-sm font-bold">
                                {loading ? "..." : (prediction?.technicalData?.volume ? `${(parseInt(prediction.technicalData.volume) / 1000000).toFixed(2)}M` : "---")}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">P/E Ratio</p>
                            <p className="text-sm font-bold">
                                {loading ? "..." : (prediction?.technicalData?.peRatio || "---")}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                        <Button
                            variant="destructive"
                            className="w-full"
                            size="sm"
                            onClick={() => handleTrade("sell")}
                        >
                            Sell
                        </Button>
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="sm"
                            onClick={() => handleTrade("buy")}
                        >
                            Buy
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <TradeDialog
                open={tradeOpen}
                onOpenChange={setTradeOpen}
                type={tradeType}
                symbol={data.symbol}
                price={data.price}
            />
        </>
    );
}
