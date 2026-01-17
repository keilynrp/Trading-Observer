import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ROLES_FILE = path.join(process.cwd(), "roles.json");

export async function GET() {
    try {
        const data = await fs.readFile(ROLES_FILE, "utf-8");
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json([]);
    }
}
