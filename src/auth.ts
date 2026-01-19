import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { authConfig } from "./auth.config";

const USERS_FILE = path.join(process.cwd(), "users.json");

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    trustHost: true,
    providers: [
        Credentials({
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
                const user = users.find((u: any) => u.email === credentials.email);

                if (!user || !user.password) return null;

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordCorrect) return null;

                return {
                    id: user.id,
                    name: user.username,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                };
            },
        }),
    ],
});
