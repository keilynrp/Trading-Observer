import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/components/providers/socket-provider";
import DashboardLayout from "@/components/layout/dashboard-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradingLab - Visionary Trading Dashboard",
  description: "Real-time trading observability and portfolio management",
};

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { PermissionProvider } from "@/components/providers/permission-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  if (theme === 'system') {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SocketProvider>
            <PermissionProvider>
              <DashboardLayout>
                {children}
              </DashboardLayout>
              <Toaster position="top-right" richColors closeButton />
            </PermissionProvider>
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
