"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { LogoutFeedbackModal } from "@/components/shared/logout-feedback-modal";
import { signOut, useSession } from "next-auth/react";
import { logoutUserCompletely } from "@/lib/utils/logout";

interface LogoutFeedbackContextType {
  openLogoutFeedback: () => Promise<void>;
  closeLogoutFeedback: () => void;
  isOpen: boolean;
  hasReviewed: boolean;
  markAsReviewed: () => void;
}

const LogoutFeedbackContext = createContext<LogoutFeedbackContextType | undefined>(undefined);

export function LogoutFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const { data: session } = useSession();

  // Check if user has previously submitted a review
  const checkIfUserReviewed = useCallback(async () => {
    if (typeof window === "undefined") return false;

    const userEmail = session?.user?.email;
    const userId = (session?.user as any)?.id;

    // 1. Check browser LocalStorage & Cookie first (Instant)
    const genericFlag = localStorage.getItem("protech_feedback_submitted") === "true";
    const userEmailFlag = userEmail && localStorage.getItem(`protech_feedback_${userEmail}`) === "true";
    const userIdFlag = userId && localStorage.getItem(`protech_feedback_${userId}`) === "true";

    if (genericFlag || userEmailFlag || userIdFlag) {
      setHasReviewed(true);
      return true;
    }

    // 2. Check Neon Database if user is authenticated
    if (session?.user) {
      try {
        const res = await fetch("/api/testimonials?checkUser=true");
        if (res.ok) {
          const data = await res.json();
          if (data.hasSubmitted) {
            setHasReviewed(true);
            localStorage.setItem("protech_feedback_submitted", "true");
            if (userEmail) localStorage.setItem(`protech_feedback_${userEmail}`, "true");
            if (userId) localStorage.setItem(`protech_feedback_${userId}`, "true");
            return true;
          }
        }
      } catch (err) {
        console.warn("Failed to check testimonial user status:", err);
      }
    }

    return false;
  }, [session]);

  useEffect(() => {
    checkIfUserReviewed();
  }, [checkIfUserReviewed]);

  const markAsReviewed = () => {
    setHasReviewed(true);
    if (typeof window !== "undefined") {
      const userEmail = session?.user?.email;
      const userId = (session?.user as any)?.id;
      localStorage.setItem("protech_feedback_submitted", "true");
      if (userEmail) localStorage.setItem(`protech_feedback_${userEmail}`, "true");
      if (userId) localStorage.setItem(`protech_feedback_${userId}`, "true");
      document.cookie = "protech_feedback_submitted=true; path=/; max-age=31536000; SameSite=Lax";
    }
  };

  const openLogoutFeedback = async () => {
    // If the user already wrote a review, stop showing the modal and log out directly!
    const alreadyReviewed = hasReviewed || (await checkIfUserReviewed());
    if (alreadyReviewed) {
      await logoutUserCompletely(signOut);
      return;
    }

    setIsOpen(true);
  };

  const closeLogoutFeedback = () => setIsOpen(false);

  // Global event listener for custom logout trigger anywhere in the DOM
  useEffect(() => {
    const handleTrigger = async () => {
      const alreadyReviewed = hasReviewed || (await checkIfUserReviewed());
      if (alreadyReviewed) {
        await logoutUserCompletely(signOut);
      } else {
        setIsOpen(true);
      }
    };
    window.addEventListener("open-logout-feedback-modal", handleTrigger);
    return () => window.removeEventListener("open-logout-feedback-modal", handleTrigger);
  }, [hasReviewed, checkIfUserReviewed]);

  return (
    <LogoutFeedbackContext.Provider
      value={{ openLogoutFeedback, closeLogoutFeedback, isOpen, hasReviewed, markAsReviewed }}
    >
      {children}
      <LogoutFeedbackModal
        isOpen={isOpen}
        onClose={closeLogoutFeedback}
        onReviewed={markAsReviewed}
        user={session?.user}
      />
    </LogoutFeedbackContext.Provider>
  );
}

export function useLogoutFeedback() {
  const context = useContext(LogoutFeedbackContext);
  if (!context) {
    return {
      openLogoutFeedback: async () => {
        if (typeof window !== "undefined") {
          const genericFlag = localStorage.getItem("protech_feedback_submitted") === "true";
          if (genericFlag) {
            await logoutUserCompletely(signOut);
            return;
          }
          window.dispatchEvent(new CustomEvent("open-logout-feedback-modal"));
        }
      },
      closeLogoutFeedback: () => {},
      isOpen: false,
      hasReviewed: false,
      markAsReviewed: () => {},
    };
  }
  return context;
}
