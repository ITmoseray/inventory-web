"use client";
import { useState } from "react";
import { SplashScreen } from "./splash-screen";

export function SplashScreenWrapper() {
    const [showSplash, setShowSplash] = useState(true);

    if (!showSplash) return null;

    return <SplashScreen onDismiss={() => setShowSplash(false)} />;
}

