import fetch from "node-fetch";

const API_KEY = "ACTH8M3BI04BCEYH";

async function verify() {
    console.log(`Testing key: ${API_KEY}`);
    try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        console.log("Response data:", JSON.stringify(data, null, 2));

        if (data["Global Quote"]) {
            console.log("SUCCESS: API Key is valid and working.");
        } else if (data["Note"] || data["Information"] || data["Error Message"]) {
            console.log("FAILURE: API Key might be invalid or rate limited.");
            console.log("Reason:", data["Note"] || data["Information"] || data["Error Message"]);
        } else {
            console.log("UNKNOWN: Received unexpected response.");
        }
    } catch (error) {
        console.error("ERROR: Failed to connect to Alpha Vantage:", error.message);
    }
}

verify();
