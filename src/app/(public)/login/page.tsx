"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid credentials", {
                    description: "Please check your email and password.",
                });
            } else {
                toast.success("Success!", {
                    description: "Redirecting you to the dashboard...",
                });
                setTimeout(() => {
                    router.push("/dashboard");
                    router.refresh();
                }, 1000);
            }
        } catch (error) {
            toast.error("Something went wrong", {
                description: "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/30 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/30 blur-[100px] rounded-full animate-pulse delay-700" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <TrendingUp className="text-white" size={24} />
                        </div>
                        <span className="font-bold text-2xl text-white tracking-tight">TradingLab</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-400">Sign in to access your dashboard</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
                    <form className="space-y-6" onSubmit={handleSubmit}>
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-200 text-sm font-medium">Password</Label>
                                <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-10 pr-12 h-12 bg-slate-950/50 border-slate-800 focus:border-blue-500/50 text-white placeholder:text-slate-600 rounded-xl"
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
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                        <p className="text-slate-400 text-sm">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Create Account</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
                    <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest">SECURE DATA</span>
                    <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                    <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest">FIPS COMPLIANT</span>
                    <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                    <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest">ENCRYPTED</span>
                </div>
            </div>
        </div>
    );
}
