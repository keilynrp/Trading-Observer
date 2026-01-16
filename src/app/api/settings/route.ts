import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "settings.json");

export async function GET() {
    try {
        const data = await fs.readFile(SETTINGS_FILE, "utf-8");
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json({ alphaVantageKey: "" });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(body, null, 2));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to save settings" }, { status: 500 });
    }
}
