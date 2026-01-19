"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Camera, Save, RefreshCw, CheckCircle2, AlertCircle, Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/components/providers/permission-provider";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const AVATAR_SEEDS = ["Jose", "Paul", "Alex", "Sam", "Jordan", "Taylor"];

export default function ProfilePage() {
    const { currentUser } = usePermissions();
    const { update } = useSession();
    const [profile, setProfile] = useState({
        username: "",
        email: "",
        bio: "",
        avatar: ""
    });
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profile");
                const data = await res.json();
                setProfile(data);
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [currentUser]);

    const handleSave = async () => {
        setIsSaving(true);
        setStatus("idle");
        try {
            // Update profile via unified API
            const profileRes = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });

            if (profileRes.ok) {
                const data = await profileRes.json();
                setProfile(data.profile);

                // Signal session update to NextAuth
                await update({
                    user: {
                        name: data.profile.username,
                        email: data.profile.email,
                        avatar: data.profile.avatar,
                    }
                });

                setStatus("success");
                toast.success("Profile updated and synced");
            } else {
                setStatus("error");
                toast.error("Failed to update profile");
            }
        } catch (error) {
            console.error("Save Error:", error);
            setStatus("error");
            toast.error("An error occurred during update");
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentUser) return;
        if (!passwords.newPassword || passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Passwords do not match or are empty");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const res = await fetch("/api/settings/users", {
                method: "POST",
                body: JSON.stringify({
                    id: currentUser.id,
                    password: passwords.newPassword
                }),
            });

            if (res.ok) {
                toast.success("Password updated successfully");
                setPasswords({ newPassword: "", confirmPassword: "" });
            } else {
                toast.error("Failed to update password");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const changeAvatar = (seed: string) => {
        const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        setProfile({ ...profile, avatar: newAvatar });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size too large. Please select an image under 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, avatar: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1 text-center md:text-left">
                <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
                    Account Overview
                </h1>
                <p className="text-muted-foreground font-medium">Manage your personal information and account security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Section: Avatar & Security */}
                <div className="md:col-span-4 space-y-8">
                    <Card className="border-primary/20 bg-card/40 backdrop-blur-md overflow-hidden shadow-xl">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Camera size={18} className="text-primary" />
                                Profile Image
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-6 pt-6 animate-in slide-in-from-top-4 duration-500">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full ring-4 ring-primary/20 overflow-hidden bg-muted flex items-center justify-center relative shadow-2xl transition-transform hover:scale-105 duration-300">
                                    {profile.avatar ? (
                                        <img src={profile.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-primary/40 bg-primary/5">
                                            {profile.username?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full space-y-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                <Button
                                    variant="outline"
                                    className="w-full gap-2 border-primary/30 hover:bg-primary/10 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Camera size={16} />
                                    Change Photo
                                </Button>

                                <div className="grid grid-cols-3 gap-2 w-full pt-2">
                                    {AVATAR_SEEDS.map((seed) => (
                                        <button
                                            key={seed}
                                            onClick={() => changeAvatar(seed)}
                                            className={cn(
                                                "w-full aspect-square rounded-lg border-2 p-1 transition-all hover:border-primary/50 overflow-hidden bg-muted/30",
                                                profile.avatar.includes(`seed=${seed}`) ? "border-primary bg-primary/10" : "border-transparent"
                                            )}
                                        >
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                                                alt={seed}
                                                className="w-full h-full object-contain"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Section */}
                    <Card className="border-primary/20 bg-card/40 backdrop-blur-md shadow-xl overflow-hidden border-t-4 border-t-primary">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck size={18} className="text-primary" />
                                Security
                            </CardTitle>
                            <CardDescription className="text-xs">Update your account password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-muted-foreground/50" size={14} />
                                    <Input
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        placeholder="Min 8 characters"
                                        className="pl-9 h-9 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-muted-foreground/50" size={14} />
                                    <Input
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        placeholder="Repeat password"
                                        className="pl-9 h-9 text-sm"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleUpdatePassword}
                                disabled={isUpdatingPassword}
                                className="w-full h-9 gap-2 mt-2 bg-primary/90 hover:bg-primary transition-all shadow-lg"
                                size="sm"
                            >
                                {isUpdatingPassword ? (
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Save size={14} />
                                )}
                                {isUpdatingPassword ? "Updating..." : "Change Password"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Section: Basic Info */}
                <div className="md:col-span-8">
                    <Card className="h-full border-primary/20 bg-card/40 backdrop-blur-md shadow-xl overflow-hidden">
                        <CardHeader className="border-b bg-muted/20 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <User size={24} className="text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">General Information</CardTitle>
                                    <CardDescription>Update your public identity and contact details.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <User size={14} className="text-primary" />
                                        Username
                                    </label>
                                    <Input
                                        value={profile.username}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, username: e.target.value })}
                                        placeholder="Your unique handle"
                                        className="bg-background/40"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Mail size={14} className="text-primary" />
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, email: e.target.value })}
                                        placeholder="hello@example.com"
                                        className="bg-background/40"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">About You</label>
                                <Textarea
                                    value={profile.bio}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Brief description for your profile..."
                                    className="min-h-[160px] resize-none bg-background/40 leading-relaxed"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between border-t bg-muted/10 p-6">
                            <div className="flex items-center gap-2">
                                {status === "success" && (
                                    <span className="flex items-center gap-1.5 text-sm text-green-500 font-bold animate-pulse">
                                        <CheckCircle2 size={16} /> Saved
                                    </span>
                                )}
                                {status === "error" && (
                                    <span className="flex items-center gap-1.5 text-sm text-red-500 font-bold">
                                        <AlertCircle size={16} /> Save Failed
                                    </span>
                                )}
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="gap-2 px-8 py-6 text-base font-bold transition-all hover:scale-[1.02] shadow-primary/20 shadow-xl"
                            >
                                {isSaving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save size={18} />}
                                {isSaving ? "Syncing..." : "Update Profile"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
