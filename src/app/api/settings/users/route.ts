import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";

const USERS_FILE = path.join(process.cwd(), "users.json");

async function getUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

export async function GET() {
    const users = await getUsers();
    // Strip passwords before sending to client
    const safeUsers = users.map(({ password, ...user }: any) => user);
    return NextResponse.json(safeUsers);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const users = await getUsers();

        if (body.action === "delete") {
            const filteredUsers = users.filter((u: any) => u.id !== body.id);
            await fs.writeFile(USERS_FILE, JSON.stringify(filteredUsers, null, 2));
            return NextResponse.json({ success: true });
        }

        const existingIndex = users.findIndex((u: any) => u.id === body.id);

        let userData = { ...body };

        // Hash password if provided
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        if (existingIndex > -1) {
            // Keep existing password if not provided in update
            if (!userData.password && users[existingIndex].password) {
                userData.password = users[existingIndex].password;
            }
            users[existingIndex] = { ...users[existingIndex], ...userData };
        } else {
            const newUser = {
                id: Date.now().toString(),
                status: "active",
                ...userData
            };
            users.push(newUser);
        }

        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
    }
}
