import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }: any) {
            if (user) {
                token.role = user.role;
                token.avatar = user.avatar;
            }
            // Handle session update trigger
            if (trigger === "update" && session) {
                if (session.user?.role) token.role = session.user.role;
                if (session.user?.avatar) token.avatar = session.user.avatar;
                if (session.user?.name) token.name = session.user.name;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role;
                session.user.avatar = token.avatar;
                // Sync name/image if next-auth uses them
                session.user.name = token.name || session.user.name;
                session.user.image = token.avatar || session.user.image;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

            if (isDashboardRoute) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }
            return true;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
