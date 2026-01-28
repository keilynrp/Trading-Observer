import { marketService } from './market-service';

export interface ForecastingResult {
    symbol: string;
    healthScore: number; // 0 to 100
    recommendation: 'BUY' | 'SELL' | 'HOLD';
    signals: {
        trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
        momentum: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
        volatility: 'HIGH' | 'LOW' | 'NORMAL';
    };
    advice: {
        when: string;
        how: string;
        why: string;
    };
    technicalData: any;
}

export class ForecastingService {
    async analyzeSymbol(symbol: string): Promise<ForecastingResult> {
        const sanitizedSymbol = symbol.trim().toUpperCase();

        // Fetch all data in parallel for efficiency
        const [quote, rsiData, macdData, smaData, bbandsData] = await Promise.all([
            marketService.getGlobalQuote(sanitizedSymbol).catch(e => { console.error('RSI Error:', e); return null; }),
            marketService.getRSI(sanitizedSymbol).catch(e => { console.error('RSI Error:', e); return null; }),
            marketService.getMACD(sanitizedSymbol).catch(e => { console.error('MACD Error:', e); return null; }),
            marketService.getSMA(sanitizedSymbol).catch(e => { console.error('SMA Error:', e); return null; }),
            marketService.getBBANDS(sanitizedSymbol).catch(e => { console.error('BBANDS Error:', e); return null; })
        ]);

        if (!quote) {
            throw new Error(`Symbol '${sanitizedSymbol}' not found or API timeout.`);
        }

        const currentPrice = parseFloat(quote.price);

        // Extract latest values (Alpha Vantage returns series indexed by date)
        const latestRsi = this.getLatestValue(rsiData, 'RSI');
        const latestMacd = this.getLatestValue(macdData, 'MACD');
        const latestMacdSignal = this.getLatestValue(macdData, 'MACD_Signal');
        const latestSma = this.getLatestValue(smaData, 'SMA');
        const latestUpperBB = this.getLatestValue(bbandsData, 'Real Upper Band');
        const latestLowerBB = this.getLatestValue(bbandsData, 'Real Lower Band');

        // Logic processing
        let score = 50; // Start at neutral
        let signals: any = { trend: 'NEUTRAL', momentum: 'NEUTRAL', volatility: 'NORMAL' };

        // 1. Momentum (RSI)
        if (latestRsi > 0) {
            if (latestRsi < 30) {
                score += 20;
                signals.momentum = 'BULLISH';
            } else if (latestRsi > 70) {
                score -= 20;
                signals.momentum = 'BEARISH';
            }
        }

        // 2. Trend (SMA & MACD)
        const macdCross = latestMacd !== 0 && latestMacdSignal !== 0 ? latestMacd > latestMacdSignal : null;
        const aboveSma = latestSma > 0 ? currentPrice > latestSma : null;

        if (macdCross === true && aboveSma === true) {
            score += 20;
            signals.trend = 'BULLISH';
        } else if (macdCross === false && aboveSma === false) {
            score -= 20;
            signals.trend = 'BEARISH';
        }

        // 3. Volatility (BBANDS)
        if (latestUpperBB > 0 && latestLowerBB > 0) {
            const range = latestUpperBB - latestLowerBB;
            const posInRange = (currentPrice - latestLowerBB) / range;

            if (posInRange < 0.2) {
                score += 10; // Potential bounce
            } else if (posInRange > 0.8) {
                score -= 10; // Potential rejection
            }
        }

        // Clamp score
        score = Math.max(0, Math.min(100, score));

        // Recommendation
        let recommendation: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
        if (score > 65) recommendation = 'BUY';
        if (score < 35) recommendation = 'SELL';

        return {
            symbol,
            healthScore: score,
            recommendation,
            signals,
            advice: this.generateAdvice(symbol, recommendation, signals, currentPrice, score),
            technicalData: {
                rsi: latestRsi,
                macd: latestMacd,
                sma: latestSma,
                price: currentPrice
            }
        };
    }

    private getLatestValue(data: any, key: string): number {
        try {
            const series = data[Object.keys(data).find(k => k.includes('Technical Analysis')) || ''];
            const lastDate = Object.keys(series)[0];
            return parseFloat(series[lastDate][key]);
        } catch (e) {
            return 0;
        }
    }

    private generateAdvice(symbol: string, rec: string, signals: any, price: number, score: number) {
        if (rec === 'BUY') {
            return {
                when: `Ahora mismo parece un punto de entrada óptimo mientras el precio se mantiene sobre los $${price.toFixed(2)}.`,
                how: "Entrada escalonada (Dollar Cost Averaging) para mitigar volatilidad residual.",
                why: `Puntaje de salud fuerte (${score}/100). Momentum alcista detectado en RSI y cruce positivo de MACD.`
            };
        } else if (rec === 'SELL') {
            return {
                when: "Considerar toma de ganancias o reducción de exposición antes de una posible corrección mayor.",
                how: "Venta parcial de posición para asegurar utilidades.",
                why: `Debilidad estructural detectada (${score}/100). El activo se encuentra en zona de sobrecompra o tendencia bajista confirmada.`
            };
        } else {
            return {
                when: "Mantener observación. No hay una señal clara de entrada o salida en este momento.",
                how: "Mantener posiciones actuales con Stop Loss ajustado.",
                why: `El mercado se encuentra en una fase de consolidación neutra (${score}/100).`
            };
        }
    }
}

export const forecastingService = new ForecastingService();
