"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LogoutFeedbackModal } from "@/components/shared/logout-feedback-modal";
import { signOut, useSession } from "next-auth/react";

interface LogoutFeedbackContextType {
  openLogoutFeedback: () => void;
  closeLogoutFeedback: () => void;
  isOpen: boolean;
}

const LogoutFeedbackContext = createContext<LogoutFeedbackContextType | undefined>(undefined);

export function LogoutFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const openLogoutFeedback = () => setIsOpen(true);
  const closeLogoutFeedback = () => setIsOpen(false);

  // Global event listener for custom logout trigger anywhere in the DOM
  useEffect(() => {
    const handleTrigger = () => setIsOpen(true);
    window.addEventListener("open-logout-feedback-modal", handleTrigger);
    return () => window.removeEventListener("open-logout-feedback-modal", handleTrigger);
  }, []);

  return (
    <LogoutFeedbackContext.Provider value={{ openLogoutFeedback, closeLogoutFeedback, isOpen }}>
      {children}
      <LogoutFeedbackModal
        isOpen={isOpen}
        onClose={closeLogoutFeedback}
        user={session?.user}
      />
    </LogoutFeedbackContext.Provider>
  );
}

export function useLogoutFeedback() {
  const context = useContext(LogoutFeedbackContext);
  if (!context) {
    return {
      openLogoutFeedback: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("open-logout-feedback-modal"));
        }
      },
      closeLogoutFeedback: () => {},
      isOpen: false,
    };
  }
  return context;
}
