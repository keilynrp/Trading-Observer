"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;
        let actualTheme: "dark" | "light" = "dark";

        if (theme === "system") {
            actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } else {
            actualTheme = theme;
        }

        setResolvedTheme(actualTheme);
        root.classList.remove("light", "dark");
        root.classList.add(actualTheme);
        localStorage.setItem("theme", theme);
    }, [theme, mounted]);

    // Handle system theme changes
    useEffect(() => {
        if (!mounted || theme !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            const actual = mediaQuery.matches ? "dark" : "light";
            setResolvedTheme(actual);
            const root = window.document.documentElement;
            root.classList.remove("light", "dark");
            root.classList.add(actual);
        };

        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, [theme, mounted]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
