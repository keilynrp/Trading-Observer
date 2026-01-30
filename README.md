# TradingLab - AI-Powered Trading Observer

<div align="center">

![Dashboard Preview](docs/screenshots/TradingLab-Visionary-Trading-Dashboard.png)

**A premium, real-time trading intelligence platform with AI-powered market predictions**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0-red)](https://pytorch.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## 🌟 Overview

TradingLab is a professional-grade trading observability platform that combines real-time market data, technical analysis, and **AI-powered LSTM predictions** to provide traders with actionable intelligence. Built with a modern microservices architecture, it seamlessly integrates Next.js for the frontend, Node.js for real-time data streaming, and a dedicated Python ML service for deep learning predictions.

## ✨ Key Features

### 🎯 StockPredict Dashboard
- **AI Prediction Visualizer**: Real-time confidence scores (0-100) with visual prediction bars
- **Live Market Data**: WebSocket-powered price updates with sub-second latency
- **Smart Trading Interface**: One-click Buy/Sell execution with position tracking
- **Portfolio Analytics**: Real-time P&L, gainers/losers, and active stock monitoring

### 🧠 AI/ML Prediction Engine
- **LSTM Neural Network**: PyTorch-based deep learning model for price prediction
- **Automated Training Pipeline**: Historical data ingestion from Alpha Vantage
- **Confidence Scoring**: Probabilistic predictions with uncertainty quantification
- **Microservice Architecture**: Dedicated Python FastAPI service for ML workloads

### 📊 Technical Analysis
- **Multi-Indicator Analysis**: RSI, MACD, SMA, Bollinger Bands
- **Health Score Algorithm**: Composite scoring based on technical signals
- **Interactive Charts**: D3.js candlestick charts with multiple timeframes
- **Volume & P/E Integration**: Fundamental data alongside technical indicators

### 💼 Trading Capabilities
- **Position Management**: Track buy/sell orders with entry prices and timestamps
- **Trade Execution Dialog**: Quantity input with real-time total calculation
- **Portfolio Persistence**: JSON-based storage for trade history
- **Real-time Notifications**: Toast alerts for successful trades

### 📰 Market Intelligence
- **News Aggregation**: Real-time financial news via Alpha Vantage
- **Sentiment Analysis**: Automated bullish/bearish scoring
- **MCP Integration**: Model Context Protocol for news streaming
- **Advanced Filtering**: Search and filter by ticker, sentiment, or date

### 🔔 Smart Alerts
- **Price Triggers**: Set "Above" or "Below" alerts for any ticker
- **Live Notifications**: Instant dashboard notifications via WebSocket
- **Make.com Integration**: Webhook support for external automation

### 🎨 User Experience
- **Dark/Light Themes**: System-aware theme switching
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Profile Management**: Customizable user profiles with avatars
- **Collapsible Sidebar**: Adaptive navigation for maximum screen space

---

## 🏗️ Architecture

### Microservices Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        TradingLab                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │   Frontend   │◄────►│   Backend    │◄────►│ ML Service│ │
│  │  (Next.js)   │      │  (Node.js)   │      │ (Python) │ │
│  │  Port: 3000  │      │  Port: 3001  │      │Port: 8080│ │
│  └──────────────┘      └──────────────┘      └──────────┘ │
│         │                     │                     │      │
│         │                     │                     │      │
│         ▼                     ▼                     ▼      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Alpha Vantage API                       │ │
│  │         (Market Data, News, Technical Indicators)    │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Charts**: D3.js
- **State Management**: React Hooks
- **WebSocket**: Socket.io-client
- **Notifications**: Sonner

#### Backend
- **Runtime**: Node.js 18+
- **WebSocket Server**: Socket.io
- **API Integration**: Alpha Vantage SDK
- **MCP Client**: Model Context Protocol
- **Caching**: In-memory with TTL

#### ML Service
- **Framework**: FastAPI
- **Deep Learning**: PyTorch 2.0
- **Data Processing**: Pandas, NumPy
- **Preprocessing**: scikit-learn
- **Model**: LSTM (Long Short-Term Memory)

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Multi-stage builds
- **Networking**: Internal Docker network
- **Volumes**: Hot-reloading for development

---

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended)
  - Docker Desktop for Windows/Mac
  - Docker Engine + Docker Compose for Linux
- **Alpha Vantage API Key** (free tier available)
  - Get your key: [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)

### Quick Start (Docker - Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trading-observer.git
   cd trading-observer
   ```

2. **Configure environment variables**
   ```bash
   # Create .env file in the root directory
   echo "ALPHA_VANTAGE_API_KEY=your_api_key_here" > .env
   echo "WS_PORT=3001" >> .env
   ```

3. **Start all services**
   ```bash
   docker compose up -d --build
   ```

4. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend WebSocket: [http://localhost:3001](http://localhost:3001)
   - ML Service: [http://localhost:8080](http://localhost:8080)

### Manual Setup (Without Docker)

#### Frontend & Backend
```bash
# Install dependencies
npm install

# Start the WebSocket server
npm run server

# In a new terminal, start the frontend
npm run dev
```

#### ML Service
```bash
# Navigate to ML service directory
cd src/ml-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the ML service
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 📁 Project Structure

```
trading-observer/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (dashboard)/          # Dashboard routes
│   │   │   ├── watchlist/        # StockPredict page
│   │   │   ├── market/           # Market analysis
│   │   │   ├── forecasting/      # AI predictions
│   │   │   ├── alerts/           # Alert management
│   │   │   └── news/             # News feed
│   │   └── api/                  # API routes
│   │       ├── forecasting/      # Prediction endpoint
│   │       ├── market/           # Market data
│   │       └── positions/        # Trade management
│   ├── components/
│   │   ├── layout/               # Dashboard layout
│   │   ├── watchlist/            # StockCard, TradeDialog
│   │   ├── market/               # Charts, analysis
│   │   ├── providers/            # Context providers
│   │   └── ui/                   # shadcn components
│   ├── services/
│   │   ├── market-service.ts     # Alpha Vantage client
│   │   └── forecasting-service.ts # Technical analysis
│   └── ml-service/               # Python ML Service
│       ├── main.py               # FastAPI app
│       ├── model.py              # LSTM architecture
│       ├── train.py              # Training pipeline
│       ├── data_loader.py        # Data fetching
│       ├── requirements.txt      # Python dependencies
│       └── Dockerfile            # ML service container
├── server/
│   ├── index.js                  # WebSocket server
│   └── mcp-client.js             # MCP integration
├── docker-compose.yml            # Multi-service orchestration
├── Dockerfile                    # Frontend/Backend container
└── README.md                     # This file
```

---

## 🧪 ML Model Training

### Training a Model for a Specific Stock

```bash
# Access the ML service container
docker exec -it trading-observer-ml bash

# Train the model (example: Apple Inc.)
python train.py --symbol AAPL

# The trained model will be saved to:
# artifacts/AAPL_model.pth
# artifacts/AAPL_scaler.pkl
```

### Training Parameters

The LSTM model uses the following hyperparameters (configurable in `train.py`):

- **Sequence Length**: 60 days (look-back window)
- **Hidden Dimensions**: 50
- **LSTM Layers**: 2
- **Epochs**: 20
- **Batch Size**: 32
- **Learning Rate**: 0.001
- **Train/Test Split**: 80/20

### Model Architecture

```python
Input (60 days of price data)
    ↓
LSTM Layer 1 (50 hidden units)
    ↓
LSTM Layer 2 (50 hidden units)
    ↓
Fully Connected Layer
    ↓
Output (Next day price prediction)
```

---

## 🔌 API Reference

### Frontend API Routes

#### `GET /api/forecasting?symbol={TICKER}`
Returns AI prediction and technical analysis for a stock.

**Response:**
```json
{
  "symbol": "AAPL",
  "healthScore": 72,
  "recommendation": "BUY",
  "signals": {
    "rsi": "neutral",
    "macd": "bullish",
    "sma": "bullish"
  },
  "technicalData": {
    "rsi": 55.2,
    "macd": 1.23,
    "sma": 188.5,
    "price": 189.17,
    "volume": "52340000",
    "peRatio": 28.5
  }
}
```

#### `POST /api/positions`
Creates a new trade position.

**Request:**
```json
{
  "symbol": "AAPL",
  "type": "buy",
  "quantity": 10,
  "entryPrice": 189.17
}
```

### ML Service API

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

#### `POST /predict` (Future Implementation)
Request prediction for a stock.

**Request:**
```json
{
  "symbol": "AAPL",
  "days": 1
}
```

---

## 🐳 Docker Configuration

### Services

| Service | Port | Description |
|---------|------|-------------|
| `frontend` | 3000 | Next.js application |
| `backend` | 3001 | WebSocket server |
| `ml-service` | 8080 | Python ML API |

### Volume Mounts

- `./src/ml-service:/app` - Hot-reloading for ML service development
- `./positions.json:/app/positions.json` - Trade persistence

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required
ALPHA_VANTAGE_API_KEY=your_api_key_here

# Optional
WS_PORT=3001
PORT=8000  # ML service internal port
```

---

## 🛣️ Roadmap

### Phase 1: Foundation ✅
- [x] Real-time market data streaming
- [x] Technical analysis indicators
- [x] StockPredict dashboard
- [x] Trading functionality
- [x] ML service infrastructure

### Phase 2: AI Integration (In Progress)
- [x] LSTM model architecture
- [x] Training pipeline
- [ ] Connect ML predictions to frontend
- [ ] Real-time inference API
- [ ] Model versioning and A/B testing

### Phase 3: Advanced Features
- [ ] Multi-asset portfolio optimization
- [ ] Backtesting engine
- [ ] Risk management tools
- [ ] Social trading features
- [ ] Mobile app (React Native)

### Phase 4: Enterprise
- [ ] Multi-user support
- [ ] Role-based access control
- [ ] Advanced charting (TradingView integration)
- [ ] Broker API integration (Alpaca, Interactive Brokers)
- [ ] Cloud deployment (AWS/GCP)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Alpha Vantage** for market data API
- **shadcn/ui** for beautiful UI components
- **PyTorch** team for the deep learning framework
- **Next.js** team for the amazing React framework

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

<div align="center">

**Built with ❤️ by the TradingLab Team**

[⭐ Star this repo](https://github.com/yourusername/trading-observer) if you find it useful!

</div>
