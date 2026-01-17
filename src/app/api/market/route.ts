import { NextResponse } from 'next/server';
import { marketService } from '@/services/market-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const func = searchParams.get('function') || 'GLOBAL_QUOTE';

    if (!symbol && func !== 'WTI' && func !== 'BRENT' && func !== 'NATURAL_GAS') {
        return NextResponse.json({ error: 'Symbol or specific function required' }, { status: 400 });
    }

    try {
        let data;
        switch (func) {
            case 'GLOBAL_QUOTE':
                data = await marketService.getGlobalQuote(symbol!);
                break;
            case 'TIME_SERIES_DAILY':
                data = await marketService.getDailyTimeSeries(symbol!);
                break;
            case 'SMA':
                data = await marketService.getSMA(symbol!);
                break;
            case 'RSI':
                data = await marketService.getRSI(symbol!);
                break;
            case 'MACD':
                data = await marketService.getMACD(symbol!);
                break;
            case 'BBANDS':
                data = await marketService.getBBANDS(symbol!);
                break;
            case 'WTI':
            case 'BRENT':
            case 'NATURAL_GAS':
                data = await marketService.getCommodity(func);
                break;
            default:
                return NextResponse.json({ error: 'Unsupported function' }, { status: 400 });
        }

        if (!data) {
            return NextResponse.json({ error: 'No data found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Market API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
    }
}
