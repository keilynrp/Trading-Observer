import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { AlphaVantageMCP } from "./mcp-client.mjs";

dotenv.config();

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*", // In production, specify the frontend URL
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.WS_PORT || 3001;
let ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";

const SETTINGS_PATH = path.join(process.cwd(), "settings.json");
const ALERTS_PATH = path.join(process.cwd(), "alerts.json");
let mcpClient = null;
let activeAlerts = [];

async function loadAlerts() {
    try {
        if (fs.existsSync(ALERTS_PATH)) {
            activeAlerts = JSON.parse(fs.readFileSync(ALERTS_PATH, "utf-8"));
        }
    } catch (error) {
        console.error("Error loading alerts.json:", error);
    }
}

async function loadSettings() {
    try {
        if (fs.existsSync(SETTINGS_PATH)) {
            const data = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
            if (data.alphaVantageKey && data.alphaVantageKey !== ALPHA_VANTAGE_KEY) {
                ALPHA_VANTAGE_KEY = data.alphaVantageKey;
                console.log("Updated API Key from settings.json");

                // Reconnect MCP if key changed
                if (mcpClient) await mcpClient.disconnect();
                mcpClient = new AlphaVantageMCP(ALPHA_VANTAGE_KEY);
                await mcpClient.connect();
            }
        } else if (!mcpClient && ALPHA_VANTAGE_KEY !== "demo") {
            mcpClient = new AlphaVantageMCP(ALPHA_VANTAGE_KEY);
            await mcpClient.connect();
        }
    } catch (error) {
        console.error("Error loading settings.json:", error);
    }
}

// Initial load
loadSettings();
loadAlerts();

// Watch for changes every 10 seconds (simpler than fs.watch for this case)
setInterval(loadSettings, 10000);
setInterval(loadAlerts, 10000);

// In-memory cache for price data
const cache = new Map();
const subscriptions = new Set();
const priceBuffers = new Map(); // Store last 20 prices for volatility/trend analysis
const NOTIFICATION_HISTORY = [];

// Thresholds for notifications
const VOLATILITY_THRESHOLD = 0.02; // 2% change in short period
const STABILITY_THRESHOLD = 0.002; // 0.2% variance for sustainability

function dispatchNotification(type, title, message, data = {}) {
    const notification = {
        id: Date.now().toString(),
        type, // 'volatility', 'trend', 'news', 'position'
        title,
        message,
        timestamp: new Date().toISOString(),
        ...data
    };

    console.log(`🔔 NOTIFICATION: [${type.toUpperCase()}] ${title} - ${message}`);
    NOTIFICATION_HISTORY.push(notification);
    if (NOTIFICATION_HISTORY.length > 50) NOTIFICATION_HISTORY.shift();

    io.emit("dashboardNotification", notification);
}

// Mock data generator for fallback
function generateMockPrice(symbol) {
    const base = parseFloat(cache.get(symbol)?.price) || (100 + Math.random() * 500);
    const change = (Math.random() - 0.5) * (base * 0.01);
    const newPrice = base + change;
    return {
        symbol,
        price: newPrice.toFixed(2),
        change: change.toFixed(2),
        changePercent: ((change / base) * 100).toFixed(2),
        timestamp: new Date().toISOString()
    };
}

async function triggerWebhook(alert, priceData) {
    const WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || "https://hook.us1.make.com/placeholder";
    console.log(`[Make.com] Triggering webhook for alert ${alert.id}...`);

    try {
        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event: "ALERT_FIRED",
                alert,
                priceData,
                timestamp: new Date().toISOString()
            })
        });
    } catch (e) {
        console.error("Failed to call Make.com webhook:", e.message);
    }
}

async function checkAlerts(priceData) {
    const symbolAlerts = activeAlerts.filter(a => a.symbol === priceData.symbol && a.active);
    const currentPrice = parseFloat(priceData.price);

    for (const alert of symbolAlerts) {
        let triggered = false;
        if (alert.type === "above" && currentPrice >= alert.value) {
            triggered = true;
        } else if (alert.type === "below" && currentPrice <= alert.value) {
            triggered = true;
        }

        if (triggered) {
            console.log(`🔥 ALERT FIRED: ${alert.symbol} ${alert.type} ${alert.value} (Current: ${currentPrice})`);

            // Broadcast to all clients
            io.emit("alertFired", {
                alert,
                priceData
            });

            // Trigger Make.com Webhook
            triggerWebhook(alert, priceData);
        }
    }
}

function analyzeMarketDynamics(symbol, price) {
    if (!priceBuffers.has(symbol)) priceBuffers.set(symbol, []);
    const buffer = priceBuffers.get(symbol);
    buffer.push(price);
    if (buffer.length > 20) buffer.shift();

    if (buffer.length < 10) return;

    // 1. Volatility Detection
    const oldest = buffer[0];
    const newest = buffer[buffer.length - 1];
    const pctChange = Math.abs((newest - oldest) / oldest);

    if (pctChange > VOLATILITY_THRESHOLD) {
        dispatchNotification(
            "volatility",
            `High Volatility: ${symbol}`,
            `${symbol} has moved ${(pctChange * 100).toFixed(2)}% in the last minute.`,
            { symbol, pctChange }
        );
        // Clear buffer partially to avoid duplicate triggers
        priceBuffers.set(symbol, buffer.slice(-5));
        return;
    }

    // 2. Trend Sustainability (Stable at level)
    const avg = buffer.reduce((a, b) => a + b, 0) / buffer.length;
    const variance = buffer.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / buffer.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev / avg < STABILITY_THRESHOLD && buffer.length === 20) {
        dispatchNotification(
            "trend",
            `Trend Stabilizing: ${symbol}`,
            `${symbol} is showing strong sustainability at $${avg.toFixed(2)}.`,
            { symbol, price: avg }
        );
        priceBuffers.set(symbol, []); // Reset after detection
    }
}

async function fetchPrice(symbol) {
    if (ALPHA_VANTAGE_KEY === "demo") {
        return generateMockPrice(symbol);
    }

    try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        const quote = data["Global Quote"];
        if (quote && quote["05. price"]) {
            return {
                symbol: quote["01. symbol"],
                price: quote["05. price"],
                change: quote["09. change"],
                changePercent: quote["10. change percent"].replace("%", ""),
                timestamp: new Date().toISOString()
            };
        }
        return generateMockPrice(symbol); // Fallback if rate limited
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        return generateMockPrice(symbol);
    }
}

// Update loop for prices
setInterval(async () => {
    for (const symbol of subscriptions) {
        const data = await fetchPrice(symbol);
        cache.set(symbol, data);
        io.to(symbol).emit("priceUpdate", data);

        // Advanced Analysis
        analyzeMarketDynamics(symbol, parseFloat(data.price));

        // Check alerts after each price update
        checkAlerts(data);
    }
}, 5000); // Update every 5 seconds

async function fetchNews() {
    // Try Direct API first for reliability in this environment
    if (ALPHA_VANTAGE_KEY !== "demo") {
        try {
            console.log("Fetching news via Direct API...");
            const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${ALPHA_VANTAGE_KEY}&limit=20`;
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.feed) {
                return data.feed;
            }
        } catch (error) {
            console.error("Error fetching news directly:", error);
        }
    }

    // Fallback to MCP if available
    if (mcpClient) {
        try {
            console.log("Fetching news via MCP...");
            const newsData = await mcpClient.getNews();
            if (newsData && newsData.content) {
                const news = JSON.parse(newsData.content[0].text);
                return news.feed;
            }
        } catch (e) {
            console.error("Failed to fetch news via MCP:", e);
        }
    }

    return null;
}

// Strategic keywords for news notifications
const STRATEGIC_KEYWORDS = ["FED", "CPI", "INTEREST RATE", "INFLATION", "SEC", "CRASH", "BREAKOUT"];

// Update loop for News
setInterval(async () => {
    const feed = await fetchNews();
    if (feed && feed.length > 0) {
        console.log(`Broadcasting ${feed.length} news items`);
        io.emit("newsUpdate", feed.slice(0, 10)); // Broadcast top 10 news to everyone

        // Strategic News Filtering
        const latest = feed[0];
        const titleContent = (latest.title + " " + latest.summary).toUpperCase();
        const hasKeyword = STRATEGIC_KEYWORDS.some(kw => titleContent.includes(kw));
        const isExtremelyBullish = latest.overall_sentiment_label === "Bullish" && latest.overall_sentiment_score > 0.6;
        const isExtremelyBearish = latest.overall_sentiment_label === "Bearish" && latest.overall_sentiment_score < -0.6;

        if (hasKeyword || isExtremelyBullish || isExtremelyBearish) {
            dispatchNotification(
                "news",
                "Strategic Market Intelligence",
                `Relevant news detected: ${latest.title}`,
                { url: latest.url, sentiment: latest.overall_sentiment_label }
            );
        }
    } else {
        console.log("No news data to broadcast");
    }
}, 60000); // 1 minute news update

// Position Change Simulation
setInterval(() => {
    if (subscriptions.size === 0) return;
    const symbols = Array.from(subscriptions);
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const types = ["Increased", "Decreased", "Liquidated", "Opened"];
    const type = types[Math.floor(Math.random() * types.length)];

    dispatchNotification(
        "position",
        "Position Update",
        `${type} position in ${randomSymbol} based on market dynamics.`,
        { symbol: randomSymbol, action: type }
    );
}, 120000); // Every 2 minutes simulate a position move

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send recent notifications to new clients
    NOTIFICATION_HISTORY.forEach(n => socket.emit("dashboardNotification", n));

    socket.on("subscribe", (symbol) => {
        console.log(`Subscribing to ${symbol}`);
        socket.join(symbol);
        subscriptions.add(symbol);

        // Send initial data if available
        if (cache.has(symbol)) {
            socket.emit("priceUpdate", cache.get(symbol));
        }
    });

    socket.on("unsubscribe", (symbol) => {
        console.log(`Unsubscribing from ${symbol}`);
        socket.leave(symbol);
        // Logic to remove from global subscriptions if no one else is watching
        const rooms = io.sockets.adapter.rooms.get(symbol);
        if (!rooms || rooms.size === 0) {
            subscriptions.delete(symbol);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

httpServer.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});
