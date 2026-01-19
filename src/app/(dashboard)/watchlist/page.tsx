"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    TrendingUp,
    Share2,
    Users,
    Award,
    Plus,
    MoreHorizontal,
    ExternalLink,
    Check,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/components/providers/socket-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

// Types
interface Watchlist {
    id: string;
    name: string;
    userId: string;
    username: string;
    symbols: string[];
    followers: number;
    isPublic: boolean;
    description: string;
    performance: string;
    createdAt?: string;
}

const CURRENT_USER_ID = "1"; // Simulating logged-in user

export default function WatchlistPage() {
    const { socket } = useSocket();
    const [prices, setPrices] = useState<any>({});
    const [activeTab, setActiveTab] = useState("my-watchlists");
    const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
    const [loading, setLoading] = useState(true);

    // New Watchlist Form State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [newListDescription, setNewListDescription] = useState("");
    const [newListSymbols, setNewListSymbols] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        fetchWatchlists();
    }, []);

    const fetchWatchlists = async () => {
        try {
            const res = await fetch("/api/watchlists");
            if (res.ok) {
                const data = await res.json();
                setWatchlists(data);
            }
        } catch (error) {
            console.error("Failed to fetch watchlists", error);
            toast.error("Failed to load watchlists");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWatchlist = async () => {
        if (!newListName) return;

        const symbolsArray = newListSymbols.split(",").map(s => s.trim().toUpperCase()).filter(s => s.length > 0);

        try {
            const res = await fetch("/api/watchlists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newListName,
                    description: newListDescription,
                    symbols: symbolsArray,
                    isPublic,
                    userId: CURRENT_USER_ID,
                    username: "keilyn" // Should come from session
                })
            });

            if (res.ok) {
                toast.success("Watchlist created!");
                setIsCreateOpen(false);
                setNewListName("");
                setNewListDescription("");
                setNewListSymbols("");
                fetchWatchlists();
            } else {
                toast.error("Failed to create watchlist");
            }
        } catch (error) {
            toast.error("Error creating watchlist");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this watchlist?")) return;

        try {
            const res = await fetch(`/api/watchlists/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Watchlist deleted");
                setWatchlists(prev => prev.filter(w => w.id !== id));
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    // Filter lists
    const myWatchlists = watchlists.filter(w => w.userId === CURRENT_USER_ID);
    const communityWatchlists = watchlists.filter(w => w.isPublic && w.userId !== CURRENT_USER_ID);

    // Socket subscription logic
    useEffect(() => {
        if (!socket || watchlists.length === 0) return;

        const allSymbols = [...new Set(watchlists.flatMap(w => w.symbols))];

        allSymbols.forEach(symbol => socket.emit("subscribe", symbol));

        socket.on("priceUpdate", (data: any) => {
            setPrices((prev: any) => ({
                ...prev,
                [data.symbol]: data
            }));
        });

        return () => {
            allSymbols.forEach(symbol => socket.emit("unsubscribe", symbol));
            socket.off("priceUpdate");
        };
    }, [socket, watchlists]);

    const handleShare = (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        // In a real app, this would be a real URL
        const url = `${window.location.origin}/watchlist?id=${id}`;
        navigator.clipboard.writeText(url);
        toast.success(`Share link copied for "${name}"`, {
            description: "You can now share this watchlist with your friends.",
            icon: <Check className="text-green-500" size={16} />
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Watchlists</h1>
                    <p className="text-muted-foreground">Manage your lists and discover what others are watching.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Share2 size={16} />
                        Share Global
                    </Button>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus size={16} />
                                New Watchlist
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Watchlist</DialogTitle>
                                <DialogDescription>Create a new collection of assets to track.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                        placeholder="e.g., Tech Growth"
                                        value={newListName}
                                        onChange={(e) => setNewListName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        placeholder="What is this list about?"
                                        value={newListDescription}
                                        onChange={(e) => setNewListDescription(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Symbols (comma separated)</Label>
                                    <Input
                                        placeholder="AAPL, TSLA, BTC"
                                        value={newListSymbols}
                                        onChange={(e) => setNewListSymbols(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="public"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="public">Make Public</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateWatchlist} disabled={!newListName}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
                <TabButton id="my-watchlists" label="My Watchlists" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton id="community" label="Community" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton id="analysts" label="Analyst Recommendations" activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 gap-6 min-h-[300px]">
                {loading && <div className="text-center py-10 text-muted-foreground">Loading watchlists...</div>}

                {!loading && activeTab === "my-watchlists" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {myWatchlists.length === 0 && (
                            <div className="col-span-2 text-center py-10 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                No watchlists found. Create one to get started!
                            </div>
                        )}
                        {myWatchlists.map(watchlist => (
                            <Card key={watchlist.id} className="bg-card/40 backdrop-blur-md border hover:border-primary/50 transition-colors group relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => handleDelete(watchlist.id, e)}
                                >
                                    <X size={16} className="text-muted-foreground hover:text-red-500" />
                                </Button>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle className="text-lg font-bold">{watchlist.name}</CardTitle>
                                        <CardDescription>{watchlist.symbols.length} Assets • {watchlist.isPublic ? "Public" : "Private"}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2 pr-8">
                                        <Button variant="ghost" size="icon" onClick={(e) => handleShare(watchlist.id, watchlist.name, e)}>
                                            <Share2 size={18} className="text-muted-foreground" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {watchlist.symbols.slice(0, 5).map(symbol => (
                                            <SymbolRow key={symbol} symbol={symbol} priceData={prices[symbol]} />
                                        ))}
                                        {watchlist.symbols.length > 5 && (
                                            <div className="text-xs text-muted-foreground text-center pt-2">
                                                + {watchlist.symbols.length - 5} more
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {!loading && activeTab === "community" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Users size={20} className="text-primary" />
                                Trending Today
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {communityWatchlists.map(list => (
                                    <Card key={list.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">
                                                        {list.name}
                                                    </CardTitle>
                                                    <CardDescription className="flex items-center gap-1">
                                                        by <span className="text-foreground font-medium">{list.username}</span>
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none font-bold">
                                                    {list.performance}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{list.description}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex -space-x-2">
                                                    {list.symbols.slice(0, 4).map(s => (
                                                        <div key={s} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold">
                                                            {s[0]}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Users size={12} />
                                                    {list.followers} followers
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Top Contributors Sidebar */}
                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg">Top Contributors</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent" />
                                            <div>
                                                <p className="text-sm font-bold">Trader_{i}42</p>
                                                <p className="text-[10px] text-muted-foreground">12 Watchlists • 2.4k followers</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="h-7 text-[10px] px-2">Follow</Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Analyst Tab - Keep mocked for now or move to separate data later */}
                {activeTab === "analysts" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Award size={20} className="text-primary" />
                                Institutional Insights
                            </h3>
                            <Badge variant="outline" className="text-xs">Updated 2h ago</Badge>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Static/Mock Analyst Data for UI completeness */}
                            <Card className="relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full transition-all group-hover:bg-primary/10" />
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge className="mb-2 bg-red-500">High Conviction</Badge>
                                            <CardTitle className="text-xl font-bold">Tech 2026 Core</CardTitle>
                                            <CardDescription className="mt-1">
                                                <span className="font-bold text-foreground">Sarah Jenkins</span> • Global Alpha Research
                                            </CardDescription>
                                        </div>
                                        <Award className="text-primary opacity-20 group-hover:opacity-100 transition-opacity" size={40} />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm italic text-muted-foreground bg-muted/30 p-3 rounded-lg border-l-4 border-primary/50">
                                        "Dominant market position in edge computing and low-latency networks."
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {["AAPL", "AMD"].map(s => (
                                            <div key={s} className="flex items-center gap-2 bg-card border px-3 py-1.5 rounded-lg">
                                                <span className="font-bold">{s}</span>
                                                <span className={cn(
                                                    "text-[10px] font-medium",
                                                    prices[s]?.changePercent >= 0 ? "text-green-500" : "text-red-500"
                                                )}>
                                                    {prices[s] ? `${prices[s].changePercent >= 0 ? '+' : ''}${prices[s].changePercent}%` : "---"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const TabButton = ({ id, label, activeTab, setActiveTab }: any) => (
    <button
        onClick={() => setActiveTab(id)}
        className={cn(
            "px-6 py-3 text-sm font-medium transition-all relative",
            activeTab === id ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
    >
        {label}
        {activeTab === id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        )}
    </button>
);

const SymbolRow = ({ symbol, priceData }: { symbol: string, priceData: any }) => {
    const isPositive = priceData ? parseFloat(priceData.changePercent) >= 0 : true;

    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-border cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-[10px]">
                    {symbol.substring(0, 1)}
                </div>
                <div className="font-bold text-sm">{symbol}</div>
            </div>
            <div className="text-right">
                <div className="font-mono text-sm font-bold">
                    {priceData ? `$${priceData.price}` : "---"}
                </div>
                <div className={cn(
                    "text-[10px] font-medium",
                    isPositive ? "text-green-500" : "text-red-500"
                )}>
                    {priceData ? `${isPositive ? '+' : ''}${priceData.changePercent}%` : "---"}
                </div>
            </div>
        </div>
    );
};
