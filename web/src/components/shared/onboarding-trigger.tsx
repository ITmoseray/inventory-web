"use client";

import { useEffect } from "react";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { OnboardingGuide } from "./onboarding-guide";

export function OnboardingTrigger() {
  const { startTour } = useOnboardingStore();

  useEffect(() => {
    // Check if user has already completed the tour
    const hasOnboarded = localStorage.getItem("protech_onboarded_v1");
    
    if (!hasOnboarded) {
      // Delay slightly to allow dashboard to render
      const timer = setTimeout(() => {
        startTour();
        localStorage.setItem("protech_onboarded_v1", "true");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [startTour]);

  return <OnboardingGuide />;
}
