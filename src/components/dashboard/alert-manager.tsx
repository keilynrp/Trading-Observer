"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Bell, Plus, Trash2, AlertTriangle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { cn } from "@/lib/utils";

interface Alert {
    id: string;
    symbol: string;
    type: "above" | "below";
    value: number;
    active: boolean;
}

export const AlertManager = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newAlert, setNewAlert] = useState({ symbol: "", type: "above", value: "" });

    useEffect(() => {
        fetchAlerts();

        const socket = io("http://localhost:3001");
        socket.on("alertFired", (data: any) => {
            toast.error(`🔔 ALERT: ${data.alert.symbol} ${data.alert.type} ${data.alert.value}`, {
                description: `Current price: $${data.priceData.price}`,
                duration: 10000,
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await fetch("/api/alerts");
            const data = await res.json();
            setAlerts(data);
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addAlert = async () => {
        if (!newAlert.symbol || !newAlert.value) {
            toast.warning("Please fill in all fields");
            return;
        }

        try {
            const res = await fetch("/api/alerts", {
                method: "POST",
                body: JSON.stringify(newAlert),
            });
            if (res.ok) {
                toast.success("Alert created!");
                setIsAdding(false);
                setNewAlert({ symbol: "", type: "above", value: "" });
                fetchAlerts();
            }
        } catch (error) {
            toast.error("Failed to create alert");
        }
    };

    const deleteAlert = async (id: string) => {
        try {
            const res = await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setAlerts(alerts.filter(a => a.id !== id));
                toast.success("Alert deleted");
            }
        } catch (error) {
            toast.error("Failed to delete alert");
        }
    };

    return (
        <Card className="h-full bg-card/40 backdrop-blur-md border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Bell size={18} className="text-primary" />
                    Active Alerts
                </CardTitle>
                <Button
                    size="sm"
                    variant={isAdding ? "ghost" : "outline"}
                    className="rounded-full h-8 gap-1"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    {isAdding ? <X size={14} /> : <Plus size={14} />}
                    {isAdding ? "Cancel" : "New Alert"}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {isAdding && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Symbol</label>
                                <Input
                                    placeholder="e.g. BTC"
                                    value={newAlert.symbol}
                                    onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value.toUpperCase() })}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Type</label>
                                <select
                                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={newAlert.type}
                                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as any })}
                                >
                                    <option value="above">Above</option>
                                    <option value="below">Below</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Price Target</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={newAlert.value}
                                onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                                className="h-8 text-xs"
                            />
                        </div>
                        <Button className="w-full h-8 text-xs gap-2" onClick={addAlert}>
                            <SaveIcon size={14} /> Create Alert
                        </Button>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <RefreshCw className="animate-spin text-primary/50" size={24} />
                    </div>
                ) : alerts.length > 0 ? (
                    alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${alert.active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <AlertTriangle size={16} />
                                </div>
                                <div>
                                    <div className="font-bold flex items-center gap-2">
                                        {alert.symbol}
                                        <span className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-tighter",
                                            alert.type === 'above' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {alert.type}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">${alert.value.toLocaleString('en-US')}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${alert.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-muted'}`} />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteAlert(alert.id)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        <Bell className="mx-auto mb-2 opacity-10" size={32} />
                        <p className="text-xs">No alerts configured</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const SaveIcon = ({ size }: { size: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
)
