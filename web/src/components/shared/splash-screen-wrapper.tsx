"use client";
import { useState, useEffect } from "react";
import { SplashScreen } from "./splash-screen";

export function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleDismiss = () => {
        setShowSplash(false);
    };

    return (
        <>
            {showSplash && <SplashScreen onDismiss={handleDismiss} />}
            {children}
        </>
    );
}
