"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";

const NEWS_MOCK = [
    {
        id: "mock-1",
        title: "Federal Reserve hints at potential rate cuts in late 2026",
        source: "Bloomberg",
        time: "Just now",
        sentiment: "positive",
        summary: "Market analysts expect a shift in monetary policy as inflation cools down faster than anticipated."
    },
    {
        id: "mock-2",
        title: "Tech stocks rally as AI remains the dominant market driver",
        source: "Reuters",
        time: "2h ago",
        sentiment: "neutral",
        summary: "The Nasdaq Composite hit a new record high today, led by strong performance in the semiconductor sector."
    },
    {
        id: "mock-3",
        title: "Oil prices stabilize amid global supply chain improvements",
        source: "CNBC",
        time: "4h ago",
        sentiment: "negative",
        summary: "Despite ongoing geopolitical tensions, new production facilities have eased supply concerns."
    }
];

const NewsItem = React.memo(({ item, isLast }: { item: any, isLast: boolean }) => (
    <div className="group cursor-pointer" onClick={() => item.url && window.open(item.url, '_blank')}>
        <div className="flex items-start justify-between mb-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.source} • {item.time}</span>
            {item.sentiment === 'positive' ? (
                <TrendingUp size={14} className="text-green-500" />
            ) : item.sentiment === 'negative' ? (
                <TrendingDown size={14} className="text-red-500" />
            ) : null}
        </div>
        <h3 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {item.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {item.summary}
        </p>
        <div className="mt-2 flex items-center gap-1 text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            Read More <ExternalLink size={10} />
        </div>
        {!isLast && <div className="mt-6 border-b border-muted" />}
    </div>
));

NewsItem.displayName = "NewsItem";

export const NewsPanel = () => {
    const { socket } = useSocket();
    const [news, setNews] = React.useState(NEWS_MOCK);

    React.useEffect(() => {
        if (!socket) return;

        const handleNewsUpdate = (data: any[]) => {
            setNews(data);
        };

        socket.on("newsUpdate", handleNewsUpdate);

        // Ensure we get data if mounting after initial connection
        socket.emit("getNews");

        return () => {
            socket.off("newsUpdate", handleNewsUpdate);
        };
    }, [socket]);

    return (
        <Card className="h-full bg-card border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Newspaper size={18} className="text-primary" />
                    Market Intelligence
                </CardTitle>
                <div className="text-[10px] bg-muted px-2 py-0.5 rounded-full uppercase tracking-tighter font-bold">
                    {news === NEWS_MOCK ? "Static Feed" : "Live Feed"}
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                {news.map((item: any, index: number) => (
                    <NewsItem
                        key={item.id}
                        item={item}
                        isLast={index === news.length - 1}
                    />
                ))}
            </CardContent>
        </Card>
    );
};
