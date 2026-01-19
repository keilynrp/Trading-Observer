import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { auth } from "@/auth";

const USERS_FILE = path.join(process.cwd(), "users.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

async function getUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveUsers(users: any[]) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await getUsers();
        const user = users.find((u: any) => u.email === session.user?.email);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return profile data including bio and avatar
        return NextResponse.json({
            username: user.username,
            email: user.email,
            bio: user.bio || "",
            avatar: user.avatar || ""
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const users = await getUsers();
        const userIndex = users.findIndex((u: any) => u.email === session.user?.email);

        if (userIndex === -1) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = users[userIndex];
        let avatarUrl = body.avatar;

        // Handle Base64 avatar upload
        if (avatarUrl && avatarUrl.startsWith("data:image")) {
            try {
                // Ensure upload directory exists
                await fs.mkdir(UPLOAD_DIR, { recursive: true });

                const base64Data = avatarUrl.split(",")[1];
                const extension = avatarUrl.split(";")[0].split("/")[1] || "png";
                const fileName = `avatar_${user.id}_${Date.now()}.${extension}`;
                const filePath = path.join(UPLOAD_DIR, fileName);

                await fs.writeFile(filePath, Buffer.from(base64Data, "base64"));

                // Set the public URL
                avatarUrl = `/uploads/avatars/${fileName}`;

                // Clean up old avatar if it was a file
                if (user.avatar && user.avatar.startsWith("/uploads/avatars/")) {
                    const oldPath = path.join(process.cwd(), "public", user.avatar);
                    try {
                        await fs.unlink(oldPath);
                    } catch (e) {
                        // Ignore if old file doesn't exist
                    }
                }
            } catch (err) {
                console.error("Failed to save avatar file:", err);
                // Fallback to existing avatar if save fails
                avatarUrl = user.avatar;
            }
        }

        // Update user record with profile info
        const updatedUser = {
            ...user,
            username: body.username || user.username,
            email: body.email || user.email,
            bio: body.bio !== undefined ? body.bio : user.bio,
            avatar: avatarUrl || user.avatar
        };

        users[userIndex] = updatedUser;
        await saveUsers(users);

        return NextResponse.json({
            success: true,
            profile: {
                username: updatedUser.username,
                email: updatedUser.email,
                bio: updatedUser.bio,
                avatar: updatedUser.avatar
            }
        });
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
    }
}
