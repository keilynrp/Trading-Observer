import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { EventSource } from "eventsource";
import dotenv from "dotenv";

dotenv.config();

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";

async function main() {
    console.log("Connecting to Alpha Vantage MCP...");
    const transport = new SSEClientTransport(new URL(`https://mcp.alphavantage.co/mcp?apikey=${ALPHA_VANTAGE_KEY}`), {
        eventSource: EventSource
    });

    const client = new Client({
        name: "test-client",
        version: "1.0.0"
    }, {
        capabilities: {}
    });

    try {
        await client.connect(transport);
        console.log("Connected!");

        const tools = await client.listTools();
        console.log("Available tools count:", tools.tools.length);

        // Find GLOBAL_QUOTE tool and log its schema
        const quoteTool = tools.tools.find(t => t.name === "GLOBAL_QUOTE");
        if (quoteTool) {
            console.log("GLOBAL_QUOTE schema:", JSON.stringify(quoteTool.inputSchema, null, 2));
        }

        const result = await client.callTool({
            name: "GLOBAL_QUOTE",
            arguments: { symbol: "AAPL" }
        });
        console.log("Result for AAPL:", JSON.stringify(result, null, 2));

        process.exit(0);
    } catch (error) {
        console.error("Error details:", error);
        process.exit(1);
    }
}

main();
