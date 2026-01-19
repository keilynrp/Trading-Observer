import React from "react";
import {
    BarChart3,
    Users,
    BellRing,
    ShieldCheck,
    Zap,
    TrendingUp,
    Globe,
    PieChart
} from "lucide-react";

const features = [
    {
        title: "Real-time Analytics",
        description: "Multi-exchange data streaming with sub-millisecond latency for precise decision making.",
        icon: <BarChart3 className="text-blue-400" size={24} />,
    },
    {
        title: "Social Watchlists",
        description: "Create, share and follow community-driven watchlists to discover emerging market trends.",
        icon: <Users className="text-emerald-400" size={24} />,
    },
    {
        title: "Smart Alerts",
        description: "Context-aware price and volatility alerts that notify you across all your devices.",
        icon: <BellRing className="text-purple-400" size={24} />,
    },
    {
        title: "News Intelligence",
        description: "AI-powered sentiment analysis on global news feeds to filter out the noise.",
        icon: <Zap className="text-amber-400" size={24} />,
    },
    {
        title: "Global Reach",
        description: "Support for thousands of stocks and cryptocurrencies around the globe.",
        icon: <Globe className="text-blue-500" size={24} />,
    },
    {
        title: "Portfolio Tracking",
        description: "Comprehensive view of your holdings with detailed P&L and performance metrics.",
        icon: <PieChart className="text-rose-400" size={24} />,
    }
];

export function Features() {
    return (
        <section className="py-24 bg-slate-950 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Built for the Modern Trader</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Everything you need to navigate the financial markets with confidence and clarity.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="p-8 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 hover:border-slate-700 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
