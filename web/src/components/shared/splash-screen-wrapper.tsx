"use client";
import { useState, useEffect } from "react";
import { SplashScreen } from "./splash-screen";

export function SplashScreenWrapper() {
    const [mounted, setMounted] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !showSplash) return null;

    return <SplashScreen onDismiss={() => setShowSplash(false)} />;
}
