import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const PROFILE_FILE = path.join(process.cwd(), "profile.json");

const DEFAULT_PROFILE = {
    username: "Jose Paul",
    email: "jose.paul@example.com",
    bio: "Full-stack developer and part-time trader. Exploring the markets with AI.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jose"
};

export async function GET() {
    try {
        const data = await fs.readFile(PROFILE_FILE, "utf-8");
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        // If file doesn't exist, return default and create it
        try {
            await fs.writeFile(PROFILE_FILE, JSON.stringify(DEFAULT_PROFILE, null, 2));
        } catch (e) {
            console.error("Failed to create profile file", e);
        }
        return NextResponse.json(DEFAULT_PROFILE);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Merge with existing profile or default
        let currentProfile = DEFAULT_PROFILE;
        try {
            const data = await fs.readFile(PROFILE_FILE, "utf-8");
            currentProfile = JSON.parse(data);
        } catch (e) {
            // Use default if file not found
        }

        const updatedProfile = { ...currentProfile, ...body };
        await fs.writeFile(PROFILE_FILE, JSON.stringify(updatedProfile, null, 2));
        return NextResponse.json({ success: true, profile: updatedProfile });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
    }
}
