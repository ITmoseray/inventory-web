"use client";

import { useEffect } from "react";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { OnboardingGuide } from "./onboarding-guide";

export function OnboardingTrigger({ businessCreatedAt }: { businessCreatedAt?: string }) {
  const { startTour } = useOnboardingStore();

  useEffect(() => {
    // Only show for businesses created recently (e.g. within the last 24 hours)
    if (!businessCreatedAt) return;
    
    const createdDate = new Date(businessCreatedAt);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

    // If business is older than 24 hours, don't show the onboarding tour
    if (hoursSinceCreation > 24) return;

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
  }, [startTour, businessCreatedAt]);

  return <OnboardingGuide />;
}
