"use client";

import React, { useEffect } from "react";
import { StoreTheme } from "@/types/store-builder";

interface Props {
  theme: StoreTheme;
  children: React.ReactNode;
}

export function StoreThemeWrapper({ theme, children }: Props) {
  const c = theme.colors || {};

  const styleObj: React.CSSProperties = {
    backgroundColor: c.background || "#FFFFFF",
    color: c.text || "#0F172A",
    minHeight: "100vh",
    fontFamily: theme.fonts?.body ? `"${theme.fonts.body}", sans-serif` : "sans-serif",
  };

  return (
    <div style={styleObj} className="w-full min-h-screen selection:bg-indigo-500 selection:text-white">
      {children}
    </div>
  );
}
