# TradingLab - Real-Time Trading Observer

TradingLab is a premium, real-time trading observability dashboard designed for professional traders. It provides a unified view of market data, technical visualizations, news intelligence, and automated alerts.

![Dashboard Preview](docs/screenshots/TradingLab-Visionary-Trading-Dashboard.png)

## 🚀 Features

### 1. Real-Time Market Feed
- **WebSocket Streaming**: Live price updates for stocks and crypto via Alpha Vantage.
- **Dynamic Watchlist**: Monitor multiple assets simultaneously with instant chart switching.
- **Theme-Aware Charts**: High-performance D3.js candlestick charts with multiple timeframes (1m to 1d).

### 2. Market Intelligence (News Feed)
- **MCP Integration**: Uses the Model Context Protocol to stream real-time news from Alpha Vantage.
- **Sentiment Analysis**: Automatic sentiment scoring (Bullish/Bearish) for every news article.
- **Dedicated Page**: A full-screen news aggregator with advanced search and filtering.

### 3. Smart Alert System
- **Precision Triggers**: Set "Above" or "Below" price alerts for any ticker.
- **Live Notifications**: Instant "toast" notifications across the dashboard.
- **Make.com Integration**: Automated webhooks for external notifications or trade execution.

### 4. User Experience
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile.
- **Profile Management**: Customize your identity and digital avatar.
- **Advanced Performance**: Memoized components and optimized D3 rendering.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS 4, shadcn/ui.
- **Backend**: Node.js WebSocket Server (Socket.io), MCP SDK.
- **Visualization**: D3.js.
- **Notifications**: Sonner.

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- Alpha Vantage API Key (Get a free one [here](https://www.alphavantage.co/support/#api-key))

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root:
   ```env
   ALPHA_VANTAGE_API_KEY=your_key_here
   WS_PORT=3001
   ```

### Running the Project
1. Start the WebSocket Server:
   ```bash
   npm run server
   ```
2. Start the Frontend:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure
- `src/app`: Next.js pages and API routes.
- `src/components`: UI components, charts, and providers.
- `server/`: WebSocket server and MCP client logic.
- `settings.json`: Local persistence for API configuration.
- `profile.json`: Mock user profile data.
- `alerts.json`: Managed price triggers.

## 📜 License
MIT
