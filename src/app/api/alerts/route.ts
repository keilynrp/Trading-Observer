import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ALERTS_FILE = path.join(process.cwd(), "alerts.json");

async function readAlerts() {
    try {
        const data = await fs.readFile(ALERTS_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeAlerts(alerts: any[]) {
    await fs.writeFile(ALERTS_FILE, JSON.stringify(alerts, null, 2));
}

export async function GET() {
    const alerts = await readAlerts();
    return NextResponse.json(alerts);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const alerts = await readAlerts();

        const newAlert = {
            id: Date.now().toString(),
            symbol: body.symbol,
            type: body.type,
            value: parseFloat(body.value),
            active: true,
            createdAt: new Date().toISOString()
        };

        alerts.push(newAlert);
        await writeAlerts(alerts);

        return NextResponse.json({ success: true, alert: newAlert });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to create alert" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        let alerts = await readAlerts();
        alerts = alerts.filter((a: any) => a.id !== id);
        await writeAlerts(alerts);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to delete alert" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        let alerts = await readAlerts();

        const index = alerts.findIndex((a: any) => a.id === body.id);
        if (index === -1) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

        alerts[index] = { ...alerts[index], ...body };
        await writeAlerts(alerts);

        return NextResponse.json({ success: true, alert: alerts[index] });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to update alert" }, { status: 500 });
    }
}
