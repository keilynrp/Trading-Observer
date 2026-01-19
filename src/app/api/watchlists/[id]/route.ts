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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const watchlists = getWatchlists();
        const filtered = watchlists.filter((w: any) => w.id !== id);

        if (watchlists.length === filtered.length) {
            return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 });
        }

        saveWatchlists(filtered);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete watchlist' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const watchlists = getWatchlists();
        const index = watchlists.findIndex((w: any) => w.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 });
        }

        watchlists[index] = { ...watchlists[index], ...body };
        saveWatchlists(watchlists);

        return NextResponse.json(watchlists[index]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update watchlist' }, { status: 500 });
    }
}
