"use client";
import { useState, useEffect } from "react";
import { SplashScreen } from "./splash-screen";

export function SplashScreenWrapper() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    try {
      // Check if the splash screen has already been shown in this app session
      const alreadyShown = sessionStorage.getItem("protech_splash_dismissed");
      if (!alreadyShown) {
        setShowSplash(true);
      }
    } catch (e) {
      // If storage is unavailable, fail gracefully without blocking the app
    }
  }, []);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem("protech_splash_dismissed", "true");
    } catch (e) {}
    setShowSplash(false);
  };

  if (!showSplash) return null;

  return <SplashScreen onDismiss={handleDismiss} />;
}


