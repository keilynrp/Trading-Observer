"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Clock, Search } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NEWS_FALLBACK = [
    {
        id: "fallback-1",
        title: "Federal Reserve signals cautious approach to monetary policy amid mixed economic data",
        source: "Bloomberg",
        time: "2h ago",
        sentiment: "neutral",
        summary: "Fed officials emphasized data dependency in their latest communications, suggesting rate decisions will be guided by incoming inflation and employment figures.",
        topics: [{ ticker: "SPY" }, { ticker: "DXY" }]
    },
    {
        id: "fallback-2",
        title: "Tech sector leads market rally as AI investments continue to drive growth",
        source: "Reuters",
        time: "4h ago",
        sentiment: "positive",
        summary: "Major technology companies posted strong gains as investors remain optimistic about artificial intelligence applications and cloud computing demand.",
        topics: [{ ticker: "NVDA" }, { ticker: "MSFT" }, { ticker: "GOOGL" }]
    },
    {
        id: "fallback-3",
        title: "Global oil prices stabilize following OPEC+ production discussions",
        source: "CNBC",
        time: "6h ago",
        sentiment: "neutral",
        summary: "Crude oil traded in a narrow range as markets digest the latest OPEC+ meeting outcomes and global demand forecasts.",
        topics: [{ ticker: "CL" }, { ticker: "XOM" }]
    },
    {
        id: "fallback-4",
        title: "Cryptocurrency market sees increased institutional adoption",
        source: "CoinDesk",
        time: "8h ago",
        sentiment: "positive",
        summary: "Major financial institutions continue to expand their digital asset offerings, signaling growing mainstream acceptance of cryptocurrencies.",
        topics: [{ ticker: "BTC" }, { ticker: "ETH" }]
    },
    {
        id: "fallback-5",
        title: "Consumer spending data shows resilient retail sector performance",
        source: "WSJ",
        time: "10h ago",
        sentiment: "positive",
        summary: "Latest retail sales figures exceeded expectations, indicating continued strength in consumer demand despite economic uncertainties.",
        topics: [{ ticker: "XRT" }, { ticker: "AMZN" }]
    },
    {
        id: "fallback-6",
        title: "Emerging markets face headwinds from strong dollar environment",
        source: "Financial Times",
        time: "12h ago",
        sentiment: "negative",
        summary: "Developing economies experience capital outflows as the US dollar strengthens, putting pressure on local currencies and bond markets.",
        topics: [{ ticker: "EEM" }, { ticker: "DXY" }]
    }
];

// Memoized News Card Component for better performance
const NewsCard = React.memo(({ item }: { item: any }) => (
    <Card
        className="bg-card border overflow-hidden group cursor-pointer hover:border-primary/50 transition-all flex flex-col shadow-sm"
        onClick={() => window.open(item.url, '_blank')}
    >
        <div className="relative h-48 w-full overflow-hidden bg-muted/20">
            {item.banner ? (
                <img
                    src={item.banner}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Newspaper className="text-muted-foreground opacity-20" size={48} />
                </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
                <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm",
                    item.sentiment === 'positive' ? "bg-green-500 text-white" :
                        item.sentiment === 'negative' ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                )}>
                    {item.sentiment}
                </span>
            </div>
        </div>
        <CardContent className="p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span className="text-primary">{item.source}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {item.time}</span>
            </div>
            <h3 className="text-lg font-bold leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-3">
                {item.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                {item.summary}
            </p>
            <div className="mt-auto flex flex-wrap gap-1">
                {item.topics?.slice(0, 3).map((topic: any) => (
                    <span key={topic.ticker || topic.topic} className="px-2 py-0.5 rounded-full bg-muted text-[9px] font-medium border">
                        {topic.ticker || topic.topic}
                    </span>
                ))}
            </div>
        </CardContent>
        <div className="px-5 py-3 border-t bg-muted/10 flex items-center justify-between group-hover:bg-muted/20 transition-colors">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Read Full Article</span>
            <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
    </Card>
));

NewsCard.displayName = "NewsCard";

export default function NewsPage() {
    const { socket } = useSocket();
    const [news, setNews] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLiveFeed, setIsLiveFeed] = useState(false);

    useEffect(() => {
        if (!socket) return;

        const handleNewsUpdate = (data: any[]) => {
            if (data && data.length > 0) {
                setNews(data);
                setIsLiveFeed(true);
            }
            setIsLoading(false);
        };

        socket.on("newsUpdate", handleNewsUpdate);

        // Request latest news on mount
        socket.emit("getNews");

        // Timeout to use fallback data if no data arrives from server
        const timeout = setTimeout(() => {
            setNews(prev => prev.length === 0 ? NEWS_FALLBACK : prev);
            setIsLoading(false);
        }, 5000);

        return () => {
            socket.off("newsUpdate", handleNewsUpdate);
            clearTimeout(timeout);
        };
    }, [socket]);

    const filteredNews = useMemo(() => {
        if (!searchQuery) return news;
        const query = searchQuery.toLowerCase();
        return news.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.summary.toLowerCase().includes(query) ||
            item.source.toLowerCase().includes(query)
        );
    }, [news, searchQuery]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Market Intelligence</h1>
                        <p className="text-muted-foreground">Stay ahead of the curve with real-time global financial news.</p>
                    </div>
                    <div className={cn(
                        "text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold",
                        isLiveFeed ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                    )}>
                        {isLiveFeed ? "Live Feed" : "Static Feed"}
                    </div>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search news..."
                        className="pl-10 rounded-full bg-card border-muted-foreground/20 focus:border-primary/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading && news.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="h-[400px] border bg- card/20 animate-pulse border-dashed" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.map((item) => (
                        <NewsCard key={item.id} item={item} />
                    ))}
                </div>
            )}

            {!isLoading && filteredNews.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Newspaper className="mb-4 opacity-10" size={64} />
                    {searchQuery ? (
                        <>
                            <p className="text-lg font-medium">No results found for "{searchQuery}"</p>
                            <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">Clear search</Button>
                        </>
                    ) : (
                        <>
                            <p className="text-lg font-medium">No news available at the moment</p>
                            <p className="text-sm mt-1">The news feed may be temporarily unavailable. Check back later.</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
