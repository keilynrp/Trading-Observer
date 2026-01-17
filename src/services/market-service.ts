/**
 * Alpha Vantage API Client
 * Free Tier limits: 5 calls per minute, 500 calls per day.
 */

const BASE_URL = 'https://www.alphavantage.co/query';

export interface MarketData {
    symbol: string;
    price: string;
    change: string;
    changePercent: string;
    latestTradingDay: string;
}

export class AlphaVantageService {
    private apiKey: string;
    private cache: Map<string, { data: any, timestamp: number }>;
    private CACHE_TTL = 60 * 1000; // 1 minute cache

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.cache = new Map();
    }

    private async fetchFromApi(params: Record<string, string>) {
        const queryParams = new URLSearchParams({
            ...params,
            apikey: this.apiKey
        });

        const cacheKey = queryParams.toString();
        const cached = this.cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
            return cached.data;
        }

        const response = await fetch(`${BASE_URL}?${queryParams}`);
        const data = await response.json();

        if (data['Note'] || data['Information']) {
            console.warn('Alpha Vantage API Note:', data['Note'] || data['Information']);
        }

        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    }

    /**
     * Get real-time quote for a specific symbol (Stock, Crypto, etc.)
     */
    async getGlobalQuote(symbol: string): Promise<MarketData | null> {
        const data = await this.fetchFromApi({
            function: 'GLOBAL_QUOTE',
            symbol: symbol
        });

        const quote = data['Global Quote'];
        if (!quote || !quote['01. symbol']) return null;

        return {
            symbol: quote['01. symbol'],
            price: quote['05. price'],
            change: quote['09. change'],
            changePercent: quote['10. change percent'],
            latestTradingDay: quote['07. latest trading day']
        };
    }

    /**
     * Get Daily Time Series
     */
    async getDailyTimeSeries(symbol: string, outputsize: 'compact' | 'full' = 'compact') {
        return this.fetchFromApi({
            function: 'TIME_SERIES_DAILY',
            symbol: symbol,
            outputsize: outputsize
        });
    }

    /**
     * Get Technical Indicator: SMA
     */
    async getSMA(symbol: string, interval: string = 'daily', time_period: number = 20, series_type: string = 'close') {
        return this.fetchFromApi({
            function: 'SMA',
            symbol: symbol,
            interval: interval,
            time_period: time_period.toString(),
            series_type: series_type
        });
    }

    /**
     * Get Technical Indicator: RSI
     */
    async getRSI(symbol: string, interval: string = 'daily', time_period: number = 14, series_type: string = 'close') {
        return this.fetchFromApi({
            function: 'RSI',
            symbol: symbol,
            interval: interval,
            time_period: time_period.toString(),
            series_type: series_type
        });
    }

    /**
     * Get Technical Indicator: MACD
     */
    async getMACD(symbol: string, interval: string = 'daily', series_type: string = 'close') {
        return this.fetchFromApi({
            function: 'MACD',
            symbol: symbol,
            interval: interval,
            series_type: series_type
        });
    }

    /**
     * Get Technical Indicator: Bollinger Bands
     */
    async getBBANDS(symbol: string, interval: string = 'daily', time_period: number = 20, series_type: string = 'close') {
        return this.fetchFromApi({
            function: 'BBANDS',
            symbol: symbol,
            interval: interval,
            time_period: time_period.toString(),
            series_type: series_type
        });
    }

    /**
     * Get Commodity Prices (e.g. WTI, BRENT, NATURAL_GAS, COPPER, ALUMINUM, WHEAT, CORN, COTTON, SUGAR, COFFEE)
     */
    async getCommodity(functionName: string, interval: string = 'monthly') {
        return this.fetchFromApi({
            function: functionName,
            interval: interval
        });
    }
}

// Export a singleton instance if we have the key
const apiKey = process.env.ALPHA_VANTAGE_API_KEY || '';
export const marketService = new AlphaVantageService(apiKey);
