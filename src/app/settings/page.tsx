"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Shield, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                const data = await res.json();
                if (data.alphaVantageKey) {
                    setApiKey(data.alphaVantageKey);
                }
            } catch (error) {
                console.error("Failed to load settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        setStatus("saving");
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                body: JSON.stringify({ alphaVantageKey: apiKey }),
            });
            if (res.ok) {
                setStatus("success");
            } else {
                setStatus("error");
            }
        } catch (error) {
            setStatus("error");
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your API integrations and system preferences.</p>
            </div>

            <div className="grid gap-6">
                <Card className="border-primary/20 bg-card/40 backdrop-blur-md">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="text-primary" size={20} />
                            <CardTitle>Alpha Vantage Integration</CardTitle>
                        </div>
                        <CardDescription>
                            Configure your API key to enable MCP (Model Context Protocol) and live market data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                API Key
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 text-muted-foreground" size={16} />
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your Alpha Vantage API Key"
                                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Your key is stored locally in <code className="bg-muted px-1 rounded text-primary">settings.json</code>. Get a free key at <a href="https://www.alphavantage.co/support/#api-key" target="_blank" className="underline hover:text-primary">alphavantage.co</a>
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                {status === "success" && (
                                    <span className="flex items-center gap-1 text-xs text-green-500 font-medium">
                                        <CheckCircle2 size={14} /> Settings saved and server notified
                                    </span>
                                )}
                                {status === "error" && (
                                    <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                        <AlertCircle size={14} /> Failed to save settings
                                    </span>
                                )}
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="min-w-[100px]"
                            >
                                {isLoading ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : status === "success" ? (
                                    "Saved!"
                                ) : (
                                    "Save Key"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/30 border-dashed">
                    <CardHeader>
                        <CardTitle className="text-base">MCP Connection Status</CardTitle>
                        <CardDescription>
                            Connection details for the Alpha Vantage MCP server.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Status</span>
                                <span className="flex items-center gap-1.5 font-medium text-green-500">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Active (SSE Transport)
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground">Endpoint</span>
                                <code className="text-xs bg-muted px-2 py-0.5 rounded">mcp.alphavantage.co/mcp</code>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-muted-foreground">Capabilities</span>
                                <span className="text-xs font-medium">Real-time quotes, technical indicators, news</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
