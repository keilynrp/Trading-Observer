import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "users.json");

export async function POST(req: Request) {
    try {
        const { fullname, username, email, password } = await req.json();

        if (!email || !password || !username) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));

        // Check if email or username already exists
        if (users.some((u: any) => u.email === email)) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }
        if (users.some((u: any) => u.username === username)) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now().toString(),
            status: "active",
            username,
            email,
            role: "trader",
            password: hashedPassword,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            fullname // Optional field for profile
        };

        users.push(newUser);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
