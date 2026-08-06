"use client";
import { useState, useEffect } from "react";
import { SplashScreen } from "./splash-screen";

export function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [showSplash, setShowSplash] = useState(false);

    useEffect(() => {
        setMounted(true);
        const hasShown = sessionStorage.getItem('splash_shown');
        if (!hasShown) {
            setShowSplash(true);
        }
    }, []);

    const handleDismiss = () => {
        setShowSplash(false);
        sessionStorage.setItem('splash_shown', 'true');
    };

    if (!mounted) return <div className="fixed inset-0 bg-slate-950" />;

    return (
        <>
            {showSplash && <SplashScreen onDismiss={handleDismiss} />}
            {!showSplash && children}
        </>
    );
}
