"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type CurrencyContextType = {
  currency: string;
  symbol: string;
  formatCurrency: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "SLL",
  symbol: "Le",
  formatCurrency: (amount: number) => `Le ${Math.round(amount).toLocaleString()}`,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [currency, setCurrency] = useState("SLL");
  const [symbol, setSymbol] = useState("Le");

  useEffect(() => {
    // In a real implementation, we would fetch the business settings here.
    // For now, we simulate fetching the base currency from the user's business object if present
    const baseCurrency = "SLL"; // e.g. session.user.business.currency
    
    setCurrency(baseCurrency);
    
    switch (baseCurrency) {
      case "USD": setSymbol("$"); break;
      case "EUR": setSymbol("€"); break;
      case "SLE": setSymbol("Le"); break;
      case "SLL": default: setSymbol("Le"); break;
    }
  }, [session]);

  const formatCurrency = (amount: number) => {
    return `${symbol} ${Math.round(amount).toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
