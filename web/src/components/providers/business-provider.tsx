"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface BusinessContextType {
  activeBusinessId: string | null;
  setActiveBusinessId: (id: string | null) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on client-side mount
    const savedId = localStorage.getItem("activeBusinessId");
    if (savedId) {
      setActiveBusinessId(savedId);
    }
  }, []);

  const setBusiness = (id: string | null) => {
    if (id) {
      localStorage.setItem("activeBusinessId", id);
    } else {
      localStorage.removeItem("activeBusinessId");
    }
    setActiveBusinessId(id);
  };

  return (
    <BusinessContext.Provider value={{ activeBusinessId, setActiveBusinessId: setBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}
