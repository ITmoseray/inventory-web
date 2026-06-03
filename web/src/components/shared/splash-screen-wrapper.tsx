"use client";
import { useState, useEffect } from "react";
import { SplashScreen } from "./splash-screen";
import { AnimatePresence } from "framer-motion";

export function SplashScreenWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [showSplash, setShowSplash] = useState(false);

    useEffect(() => {
        setMounted(true);
        const hasShown = sessionStorage.getItem('splash_shown');
        if (!hasShown) {
            setShowSplash(true);
            const timer = setTimeout(() => {
                setShowSplash(false);
                sessionStorage.setItem('splash_shown', 'true');
            }, 3500); // Reduced from 10s to 3.5s for professional feel
            return () => clearTimeout(timer);
        }
    }, []);

    if (!mounted) return <div className="fixed inset-0 bg-slate-950" />;

    return (
        <>
            <AnimatePresence mode="wait">
                {showSplash && <SplashScreen key="splash" />}
            </AnimatePresence>
            {!showSplash && children}
        </>
    );
}
