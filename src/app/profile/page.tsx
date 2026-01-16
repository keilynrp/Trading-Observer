"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Camera, Save, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const AVATAR_SEEDS = ["Jose", "Paul", "Alex", "Sam", "Jordan", "Taylor"];

export default function ProfilePage() {
    const [profile, setProfile] = useState({
        username: "",
        email: "",
        bio: "",
        avatar: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
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
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setStatus("idle");
        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                body: JSON.stringify(profile),
            });
            if (res.ok) {
                setStatus("success");
                // Trigger a global update or just update local state
                const data = await res.json();
                setProfile(data.profile);
            } else {
                setStatus("error");
            }
        } catch (error) {
            setStatus("error");
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatus("idle"), 3000);
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

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
                <p className="text-muted-foreground">Manage your personal information and how you appear to others.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar Selection */}
                <Card className="md:col-span-1 h-fit border-primary/20 bg-card/40 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Camera size={18} className="text-primary" />
                            Your Avatar
                        </CardTitle>
                        <CardDescription>Choose an avatar or upload your own.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6 pb-6">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full ring-4 ring-primary/20 overflow-hidden bg-muted flex items-center justify-center relative">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-muted-foreground" />
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
                                className="w-full gap-2 border-primary/30 hover:bg-primary/10"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera size={16} />
                                Upload Custom Photo
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or choice an avatar</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 w-full">
                                {AVATAR_SEEDS.map((seed) => (
                                    <button
                                        key={seed}
                                        onClick={() => changeAvatar(seed)}
                                        className={cn(
                                            "w-full aspect-square rounded-lg border-2 p-1 transition-all hover:border-primary/50 overflow-hidden bg-muted/50",
                                            profile.avatar.includes(`seed=${seed}`) ? "border-primary shadow-md scale-105" : "border-transparent"
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

                {/* Right Column: User Info Form */}
                <Card className="md:col-span-2 border-primary/20 bg-card/40 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User size={18} className="text-primary" />
                            Basic Information
                        </CardTitle>
                        <CardDescription>Update your username, email and public bio.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-muted-foreground" size={16} />
                                    <Input
                                        value={profile.username}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, username: e.target.value })}
                                        placeholder="Enter your username"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-muted-foreground" size={16} />
                                    <Input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, email: e.target.value })}
                                        placeholder="your.email@example.com"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Public Bio</label>
                                <Textarea
                                    value={profile.bio}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Tell us a bit about yourself..."
                                    className="min-h-[120px] resize-none"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t pt-6">
                        <div className="flex items-center gap-2">
                            {status === "success" && (
                                <span className="flex items-center gap-1 text-xs text-green-500 font-medium animate-in fade-in slide-in-from-bottom-1">
                                    <CheckCircle2 size={14} /> Profile updated successfully
                                </span>
                            )}
                            {status === "error" && (
                                <span className="flex items-center gap-1 text-xs text-red-500 font-medium animate-in shake">
                                    <AlertCircle size={14} /> Failed to save profile
                                </span>
                            )}
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="gap-2 min-w-[140px]"
                        >
                            {isSaving ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {isSaving ? "Saving..." : "Update Profile"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
