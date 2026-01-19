import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'watchlists.json');

function getWatchlists() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function saveWatchlists(watchlists: any[]) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(watchlists, null, 2));
}

export async function GET() {
    const watchlists = getWatchlists();
    return NextResponse.json(watchlists);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, symbols, description, isPublic, username, userId } = body;

        if (!name || !userId) {
            return NextResponse.json({ error: 'Name and User ID are required' }, { status: 400 });
        }

        const watchlists = getWatchlists();

        const newWatchlist = {
            id: Date.now().toString(),
            name,
            userId,
            username: username || 'Anonymous',
            symbols: symbols || [],
            followers: 0,
            isPublic: isPublic || false,
            description: description || '',
            performance: '0.0%',
            createdAt: new Date().toISOString()
        };

        watchlists.push(newWatchlist);
        saveWatchlists(watchlists);

        return NextResponse.json(newWatchlist);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create watchlist' }, { status: 500 });
    }
}
