import { NextResponse } from 'next/server';
import { forecastingService } from '@/services/forecasting-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        const analysis = await forecastingService.analyzeSymbol(symbol);
        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Forecasting API Error:', error);
        return NextResponse.json({ error: 'Failed to perform forecasting analysis' }, { status: 500 });
    }
}
