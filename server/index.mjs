import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { AlphaVantageMCP } from "./mcp-client.mjs";

dotenv.config();

process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ UNHANDLED REJECTION at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("❌ UNCAUGHT EXCEPTION:", err);
});

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        credentials: true
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

let dailyRequestsUsed = 0;
let lastRequestResetDate = new Date().toISOString().split("T")[0];

async function loadSettings() {
    try {
        if (fs.existsSync(SETTINGS_PATH)) {
            const data = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));

            // API Key Handling
            if (data.alphaVantageKey && data.alphaVantageKey !== ALPHA_VANTAGE_KEY) {
                ALPHA_VANTAGE_KEY = data.alphaVantageKey;
                console.log("Updated API Key from settings.json");

                if (mcpClient) await mcpClient.disconnect();
                mcpClient = new AlphaVantageMCP(ALPHA_VANTAGE_KEY);
                await mcpClient.connect();
            }

            // Quota Tracking
            const today = new Date().toISOString().split("T")[0];
            if (data.lastRequestResetDate === today) {
                dailyRequestsUsed = data.dailyRequestsUsed || 0;
            } else {
                dailyRequestsUsed = 0;
                lastRequestResetDate = today;
                saveSettings(); // Persist reset
            }
        } else if (!mcpClient && ALPHA_VANTAGE_KEY !== "demo") {
            mcpClient = new AlphaVantageMCP(ALPHA_VANTAGE_KEY);
            await mcpClient.connect();
        }
    } catch (error) {
        console.error("Error loading settings.json:", error);
    }
}

function saveSettings() {
    try {
        const currentData = fs.existsSync(SETTINGS_PATH) ? JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8")) : {};
        const newData = {
            ...currentData,
            alphaVantageKey: ALPHA_VANTAGE_KEY,
            dailyRequestsUsed,
            lastRequestResetDate
        };
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(newData, null, 2));
    } catch (error) {
        console.error("Error saving settings.json:", error);
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

// --- Smart Scheduler State ---
const DAILY_LIMIT = 25;
const UPDATE_INTERVAL = Math.floor((24 * 60 * 60 * 1000) / DAILY_LIMIT); // ~57.6 mins
let currentTickerIndex = 0;
let lastUpdateTimestamp = 0;

// Thresholds for notifications
const VOLATILITY_THRESHOLD = 0.02; // 2% change in short period
const STABILITY_THRESHOLD = 0.002; // 0.2% variance for sustainability

function broadcastQuota() {
    const remaining = Math.max(0, DAILY_LIMIT - dailyRequestsUsed);
    io.emit("quotaUpdate", {
        used: dailyRequestsUsed,
        remaining,
        total: DAILY_LIMIT
    });
}

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

const CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "DOT", "MATIC"];

async function fetchPrice(symbol) {
    if (ALPHA_VANTAGE_KEY === "demo") {
        return generateMockPrice(symbol);
    }

    try {
        const isCrypto = CRYPTO_SYMBOLS.includes(symbol.toUpperCase());
        let url;

        if (isCrypto) {
            // Use Currency Exchange Rate for crypto
            url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${ALPHA_VANTAGE_KEY}`;
        } else {
            // Use Global Quote for stocks
            url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
        }

        const response = await fetch(url);
        dailyRequestsUsed++;
        saveSettings();
        broadcastQuota();

        const data = await response.json();

        if (data["Information"] || data["Note"]) {
            console.warn(`⚠️ Alpha Vantage Rate Limit Hit for ${symbol}: ${data["Information"] || data["Note"]}`);
            return generateMockPrice(symbol);
        }

        if (isCrypto) {
            const rate = data["Realtime Currency Exchange Rate"];
            if (rate && rate["5. Exchange Rate"]) {
                // Map crypto rate to the same format as quote
                const price = parseFloat(rate["5. Exchange Rate"]);
                // For crypto we don't get 24h change from this endpoint easily without another call
                // but we can at least return the price.
                return {
                    symbol: symbol.toUpperCase(),
                    price: price.toFixed(2),
                    change: "0.00",
                    changePercent: "0.00",
                    timestamp: new Date().toISOString(),
                    isCrypto: true
                };
            }
        } else {
            const quote = data["Global Quote"];
            if (quote && quote["05. price"]) {
                return {
                    symbol: quote["01. symbol"],
                    price: quote["05. price"],
                    change: quote["09. change"],
                    changePercent: quote["10. change percent"].replace("%", ""),
                    timestamp: new Date().toISOString(),
                    isCrypto: false
                };
            }
        }

        console.warn(`⚠️ No data found for ${symbol}, falling back to mock.`);
        return generateMockPrice(symbol);
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        return generateMockPrice(symbol);
    }
}

// --- Smart Scheduler (Spread 25 requests over 24 hours) ---
async function performSmartUpdate() {
    const symbols = Array.from(subscriptions);
    if (symbols.length === 0) {
        console.log("⏰ Scheduler: No active subscriptions. Waiting...");
        return;
    }

    // Round-robin selection
    const symbol = symbols[currentTickerIndex % symbols.length];
    currentTickerIndex++;

    console.log(`📡 Scheduler: Updating ${symbol} (Next update in ${Math.floor(UPDATE_INTERVAL / 1000 / 60)} mins)`);

    const data = await fetchPrice(symbol);
    cache.set(symbol, data);
    io.to(symbol).emit("priceUpdate", data);

    // Advanced Analysis
    analyzeMarketDynamics(symbol, parseFloat(data.price));

    // Check alerts
    checkAlerts(data);

    lastUpdateTimestamp = Date.now();

    const nextUpdate = new Date(Date.now() + UPDATE_INTERVAL).toLocaleTimeString();
    console.log(`✅ Update complete. Next trigger at: ${nextUpdate}`);
}

// Initial trigger
performSmartUpdate();

// Set the long interval
setInterval(performSmartUpdate, UPDATE_INTERVAL);

// In-memory cache for news
let cachedNews = [];

async function fetchNews(retries = 2, delay = 2000) {
    // Try Direct API first
    if (ALPHA_VANTAGE_KEY !== "demo") {
        for (let i = 0; i <= retries; i++) {
            try {
                console.log(`📡 Fetching news via Direct API (Attempt ${i + 1})...`);
                const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${ALPHA_VANTAGE_KEY}&limit=20`;

                // Use AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                // Increment quota
                dailyRequestsUsed++;
                saveSettings();
                broadcastQuota();

                const data = await response.json();
                if (data && data.feed) {
                    return processNewsFeed(data.feed);
                } else if (data["Note"] || data["Information"]) {
                    console.warn(`⚠️ News API Rate Limit: ${data["Note"] || data["Information"]}`);
                    break; // Don't retry if it's a rate limit
                }
            } catch (error) {
                const isTimeout = error.name === 'AbortError' || error.code === 'ETIMEDOUT';
                console.error(`❌ Error fetching news (Attempt ${i + 1}):`, isTimeout ? "Timeout (10s)" : error.message);

                if (i < retries) {
                    console.log(`Retrying in ${delay / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                }
            }
        }
    }

    // Fallback to MCP
    if (mcpClient) {
        try {
            console.log("📡 Fetching news via MCP...");
            const newsData = await mcpClient.getNews();
            if (newsData && newsData.content) {
                const news = JSON.parse(newsData.content[0].text);
                return processNewsFeed(news.feed);
            }
        } catch (e) {
            console.error("❌ Failed to fetch news via MCP:", e);
        }
    }

    return null;
}

function processNewsFeed(feed) {
    if (!feed) return [];
    return feed.slice(0, 20).map((item, index) => {
        // Generate a stable ID based on the URL or title if URL is missing
        const stableId = item.url ? 
            Buffer.from(item.url).toString('base64').substring(0, 32) : 
            `news-${Date.now()}-${index}`;

        return {
            id: stableId,
            title: item.title,
            source: item.source || "Alpha Vantage",
            time: formatAlphaVantageDate(item.time_published),
            sentiment: mapSentiment(item.overall_sentiment_label),
            summary: item.summary,
            url: item.url,
            banner: item.banner_image, // Enriched: include banner
            score: item.overall_sentiment_score,
            topics: item.ticker_sentiment // Enriched: include topics/tickers
        };
    });
}

function formatAlphaVantageDate(rawDate) {
    if (!rawDate) return "Just now";
    // Format: 20240116T213359 -> ISO
    const formatted = rawDate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6");
    return new Date(formatted).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mapSentiment(label) {
    if (!label) return "neutral";
    const l = label.toLowerCase();
    if (l.includes("bullish")) return "positive";
    if (l.includes("bearish")) return "negative";
    return "neutral";
}

// Strategic keywords for news notifications
const STRATEGIC_KEYWORDS = ["FED", "CPI", "INTEREST RATE", "INFLATION", "SEC", "CRASH", "BREAKOUT"];

async function updateNewsFeed() {
    const processedFeed = await fetchNews();
    if (processedFeed && processedFeed.length > 0) {
        console.log(`✅ Broadcasting ${processedFeed.length} processed news items`);
        cachedNews = processedFeed;
        io.emit("newsUpdate", cachedNews);

        // Strategic News Filtering for Notifications
        const latest = processedFeed[0];
        const titleContent = (latest.title + " " + latest.summary).toUpperCase();
        const hasKeyword = STRATEGIC_KEYWORDS.some(kw => titleContent.includes(kw));
        const isExtremelyBullish = latest.sentiment === "positive" && latest.score > 0.6;
        const isExtremelyBearish = latest.sentiment === "negative" && latest.score < -0.6;

        if (hasKeyword || isExtremelyBullish || isExtremelyBearish) {
            dispatchNotification(
                "news",
                "Strategic Market Intelligence",
                `Relevant news detected: ${latest.title}`,
                { url: latest.url, sentiment: latest.sentiment }
            );
        }
    } else {
        console.log("⚠️ No new news data available.");
    }
}

// Update loop for News: Every 6 hours (4 times per day to optimize API quota)
const NEWS_UPDATE_INTERVAL = 6 * 60 * 60 * 1000; // 21600000 ms
setInterval(updateNewsFeed, NEWS_UPDATE_INTERVAL);
// Initial fetch
updateNewsFeed();

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

    // Send recent notifications and news to new clients
    NOTIFICATION_HISTORY.forEach(n => socket.emit("dashboardNotification", n));
    // No need to emit newsUpdate here if the client will request it or we wait for the next loop
    // But sending it once on connection is good for UX.
    if (cachedNews.length > 0) socket.emit("newsUpdate", cachedNews);

    socket.on("subscribe", (symbol) => {
        console.log(`Subscribing to ${symbol}`);
        socket.join(symbol);
        subscriptions.add(symbol);

        // Send initial data if available
        if (cache.has(symbol)) {
            socket.emit("priceUpdate", cache.get(symbol));
        }
    });

    socket.on("getNews", () => {
        if (cachedNews.length > 0) {
            socket.emit("newsUpdate", cachedNews);
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

    // Send quota info
    broadcastQuota();

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

httpServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`❌ FATAL: Port ${PORT} is already in use. Please run reset-dev.ps1.`);
    } else {
        console.error("❌ FATAL: Server error:", err);
    }
    process.exit(1);
});

httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 WebSocket server is now LISTENING on port ${PORT}`);
    console.log(`📡 Access via http://127.0.0.1:${PORT}`);
});
