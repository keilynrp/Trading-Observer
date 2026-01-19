import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                // Avoid storing large Base64 avatars in the cookie (HTTP 431 error)
                if (user.avatar && !user.avatar.startsWith("data:")) {
                    token.avatar = user.avatar;
                }
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role;
                session.user.avatar = token.avatar;
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
