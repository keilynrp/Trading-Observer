"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Clock, Search } from "lucide-react";
import { io } from "socket.io-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NewsPage() {
    const [news, setNews] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const socket = io("http://localhost:3001");

        socket.on("newsUpdate", (data: any[]) => {
            const mappedNews = data.map((item, index) => ({
                id: index,
                title: item.title,
                source: item.source || "Alpha Vantage",
                time: new Date(item.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6")).toLocaleString(),
                sentiment: item.overall_sentiment_label?.toLowerCase().includes("bullish") ? "positive" :
                    item.overall_sentiment_label?.toLowerCase().includes("bearish") ? "negative" : "neutral",
                sentimentScore: item.overall_sentiment_score,
                summary: item.summary,
                url: item.url,
                banner: item.banner_image,
                topics: item.topics
            }));
            setNews(mappedNews);
            setIsLoading(false);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Market Intelligence</h1>
                    <p className="text-muted-foreground">Stay ahead of the curve with real-time global financial news.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search news..."
                        className="pl-10 rounded-full bg-card"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="h-[400px] border bg-card/40 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.map((item) => (
                        <Card
                            key={item.id}
                            className="bg-card/40 backdrop-blur-md border overflow-hidden group cursor-pointer hover:border-primary/50 transition-all flex flex-col"
                            onClick={() => window.open(item.url, '_blank')}
                        >
                            <div className="relative h-48 w-full overflow-hidden">
                                {item.banner ? (
                                    <img src={item.banner} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                        <Newspaper className="text-muted-foreground opacity-20" size={48} />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
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
                                        <span key={topic.topic} className="px-2 py-0.5 rounded-full bg-muted text-[9px] font-medium border">
                                            {topic.topic}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                            <div className="px-5 py-3 border-t bg-muted/20 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Read Full Article</span>
                                <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && filteredNews.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Search className="mb-4 opacity-10" size={64} />
                    <p className="text-lg font-medium">No results found for "{searchQuery}"</p>
                    <Button variant="link" onClick={() => setSearchQuery("")}>Clear all filters</Button>
                </div>
            )}
        </div>
    );
}
