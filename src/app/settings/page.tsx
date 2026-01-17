"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, Shield, RefreshCw, CheckCircle2, AlertCircle, Users, Lock, ChevronRight, UserPlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/components/providers/permission-provider";

type Tab = "general" | "users" | "roles";

export default function SettingsPage() {
    const { hasPermission, isLoading: permissionsLoading } = usePermissions();
    const [activeTab, setActiveTab] = useState<Tab>("general");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

    // General Settings State
    const [apiKey, setApiKey] = useState("");

    // Users State
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUser, setNewUser] = useState({ username: "", email: "", role: "viewer", password: "" });

    useEffect(() => {
        fetchGeneralSettings();
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchGeneralSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (data.alphaVantageKey) setApiKey(data.alphaVantageKey);
        } catch (error) {
            console.error("Failed to load settings:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/settings/users");
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users:", error);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch("/api/settings/roles");
            const data = await res.json();
            setRoles(data);
        } catch (error) {
            console.error("Failed to load roles:", error);
        }
    };

    const handleSaveGeneral = async () => {
        setIsLoading(true);
        setStatus("saving");
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                body: JSON.stringify({ alphaVantageKey: apiKey }),
            });
            if (res.ok) setStatus("success");
            else setStatus("error");
        } catch (error) {
            setStatus("error");
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    const handleAddUser = async () => {
        if (!newUser.username || !newUser.email || !newUser.password) return;
        setIsLoading(true);
        try {
            const res = await fetch("/api/settings/users", {
                method: "POST",
                body: JSON.stringify(newUser),
            });
            if (res.ok) {
                setIsAddingUser(false);
                setNewUser({ username: "", email: "", role: "viewer", password: "" });
                fetchUsers();
            }
        } catch (error) {
            console.error("Failed to add user");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch("/api/settings/users", {
                method: "POST",
                body: JSON.stringify({ id, action: "delete" }),
            });
            if (res.ok) fetchUsers();
        } catch (error) {
            console.error("Failed to delete user");
        }
    };

    const renderGeneral = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                        <label className="text-sm font-medium">API Key</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 text-muted-foreground" size={16} />
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your Alpha Vantage API Key"
                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            {status === "success" && <span className="text-xs text-green-500">Settings saved</span>}
                            {status === "error" && <span className="text-xs text-red-500">Error saving settings</span>}
                        </div>
                        <Button onClick={handleSaveGeneral} disabled={isLoading}>
                            {isLoading ? <RefreshCw className="animate-spin mr-2" size={14} /> : "Save Key"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium">Platform Users</h3>
                    <p className="text-sm text-muted-foreground">Manage who has access and their roles.</p>
                </div>
                <Button size="sm" onClick={() => setIsAddingUser(!isAddingUser)} variant={isAddingUser ? "outline" : "default"}>
                    {isAddingUser ? "Cancel" : <><UserPlus className="mr-2" size={14} /> Add User</>}
                </Button>
            </div>

            {isAddingUser && (
                <Card className="border-dashed border-primary/50 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input
                                placeholder="Username"
                                value={newUser.username}
                                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                            />
                            <input
                                placeholder="Email"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={newUser.password}
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                            />
                            <select
                                value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                            >
                                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button size="sm" onClick={handleAddUser} disabled={isLoading}>Create User</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="overflow-hidden border-border/50">
                <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                        {users.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{user.username}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider">
                                        <Lock size={10} className="text-primary" />
                                        {user.role}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderRoles = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <Card key={role.id} className="border-border/50 bg-card/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center justify-between">
                                {role.name}
                                <div className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase">{role.id}</div>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Assigned permissions for this role.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {role.permissions.map((perm: string) => (
                                <div key={perm} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="w-1 h-1 rounded-full bg-primary" />
                                    {perm.replace(/_/g, " ")}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    if (permissionsLoading) return <div className="flex items-center justify-center h-64">Loading Permissions...</div>;
    if (!hasPermission("edit_settings")) return <div className="p-8 text-center text-red-500">Access Denied: You do not have permission to edit settings.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        System Configuration
                    </h1>
                    <p className="text-muted-foreground">Manage your platform parameters, users and access control.</p>
                </div>
            </div>

            {/* Glassmorphic Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-muted/30 border border-border/50 w-fit backdrop-blur-sm">
                <button
                    onClick={() => setActiveTab("general")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        activeTab === "general" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Shield size={16} /> General
                </button>
                {hasPermission("manage_users") && (
                    <button
                        onClick={() => setActiveTab("users")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                            activeTab === "users" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Users size={16} /> Users
                    </button>
                )}
                {hasPermission("manage_roles") && (
                    <button
                        onClick={() => setActiveTab("roles")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                            activeTab === "roles" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Lock size={16} /> Roles
                    </button>
                )}
            </div>

            <div className="mt-8">
                {activeTab === "general" && renderGeneral()}
                {activeTab === "users" && renderUsers()}
                {activeTab === "roles" && renderRoles()}
            </div>
        </div>
    );
}
