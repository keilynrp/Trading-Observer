"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const fullname = formData.get("fullname") as string;
        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullname, username, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            toast.success("Account created!", {
                description: "You can now sign in with your credentials.",
            });

            setTimeout(() => {
                router.push("/login");
            }, 1500);

        } catch (error: any) {
            toast.error("Registration failed", {
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/20 blur-[100px] rounded-full animate-pulse delay-700" />
            </div>

            <div className="w-full max-w-lg relative z-10">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <TrendingUp className="text-white" size={24} />
                        </div>
                        <span className="font-bold text-2xl text-white tracking-tight">TradingLab</span>
                    </Link>
                    <Link href="/login" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
                        <ArrowLeft size={16} />
                        Back to Sign In
                    </Link>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 p-10 rounded-3xl shadow-2xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-slate-400">Join the elite network of visionary traders.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="fullname" className="text-slate-200 text-sm font-medium">Full Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                    <Input
                                        id="fullname"
                                        name="fullname"
                                        placeholder="John Doe"
                                        className="pl-10 h-12 bg-slate-950/50 border-slate-800 focus:border-blue-500/50 text-white placeholder:text-slate-600 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-slate-200 text-sm font-medium">Username</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                    <Input
                                        id="username"
                                        name="username"
                                        placeholder="visionary_trader"
                                        className="pl-10 h-12 bg-slate-950/50 border-slate-800 focus:border-blue-500/50 text-white placeholder:text-slate-600 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200 text-sm font-medium">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10 h-12 bg-slate-950/50 border-slate-800 focus:border-blue-500/50 text-white placeholder:text-slate-600 rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-200 text-sm font-medium">Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-10 pr-12 h-12 bg-slate-950/50 border-slate-800 focus:border-emerald-500/50 text-white placeholder:text-slate-600 rounded-xl"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 pl-1">Must be at least 8 characters with one number and special character.</p>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : "Create Professional Account"}
                            </Button>
                        </div>

                        <p className="text-[11px] text-slate-500 text-center px-4">
                            By clicking "Create Account", you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
