
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const POSITIONS_FILE = path.join(process.cwd(), 'positions.json');

function getPositions() {
    if (!fs.existsSync(POSITIONS_FILE)) {
        return [];
    }
    const data = fs.readFileSync(POSITIONS_FILE, 'utf-8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function savePositions(positions: any[]) {
    fs.writeFileSync(POSITIONS_FILE, JSON.stringify(positions, null, 2));
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { symbol, type, quantity, entryPrice } = body;

        if (!symbol || !type || !quantity || !entryPrice) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const positions = getPositions();

        const newPosition = {
            id: `pos_${Date.now()}`,
            symbol,
            type, // 'buy' or 'sell'
            quantity,
            entryPrice,
            timestamp: new Date().toISOString()
        };

        positions.push(newPosition);
        savePositions(positions);

        return NextResponse.json(newPosition);
    } catch (error) {
        console.error("Failed to save position", error);
        return NextResponse.json({ error: 'Failed to save position' }, { status: 500 });
    }
}
