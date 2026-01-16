import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { EventSource } from "eventsource";

export class AlphaVantageMCP {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = null;
        this.transport = null;
    }

    async connect() {
        if (this.apiKey === "demo") return false;

        try {
            this.transport = new SSEClientTransport(new URL(`https://mcp.alphavantage.co/mcp?apikey=${this.apiKey}`), {
                eventSource: EventSource
            });

            this.client = new Client({
                name: "trading-observer-server",
                version: "1.0.0"
            });

            await this.client.connect(this.transport);
            console.log("Connected to Alpha Vantage MCP");
            return true;
        } catch (error) {
            console.error("Failed to connect to Alpha Vantage MCP:", error);
            return false;
        }
    }

    async getNews(symbol) {
        if (!this.client) return null;

        try {
            const result = await this.client.callTool({
                name: "NEWS_SENTIMENT",
                arguments: symbol ? { tickers: symbol } : {}
            });
            return result;
        } catch (error) {
            console.error("Error fetching news from MCP:", error);
            return null;
        }
    }

    async disconnect() {
        if (this.transport) {
            await this.transport.close();
            this.client = null;
            this.transport = null;
        }
    }
}
