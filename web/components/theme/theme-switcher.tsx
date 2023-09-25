"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Typography } from "@mui/material";

type Props = {
    children?: React.ReactNode;
}

export default function ThemeSwitcher({ children }: Props) {
    const [mounted, setMounted] = useState(false);
    const { theme, resolvedTheme, setTheme } = useTheme();

    // When mounted on client, now we can show the UI
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div>
            <Typography variant="h5" gutterBottom color={theme}>
                Persisted{" "} test
                {resolvedTheme !== theme ? `${theme} (${resolvedTheme})` : theme} mode
            </Typography>
            <button onClick={() => setTheme("light")}>Light Mode</button>
            <button onClick={() => setTheme("dark")}>Dark Mode</button>
            <button onClick={() => setTheme("system")}>System Pref</button>
        </div>
    )
}