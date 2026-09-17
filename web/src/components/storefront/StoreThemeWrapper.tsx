"use client";

import React from "react";
import { StoreTheme, normalizeStoreTheme } from "@/types/store-builder";

interface Props {
  theme?: any;
  children: React.ReactNode;
}

export function StoreThemeWrapper({ theme: rawTheme, children }: Props) {
  const theme = normalizeStoreTheme(rawTheme);
  const c = theme.colors;

  const styleObj: React.CSSProperties & Record<string, string> = {
    backgroundColor: c.background,
    color: c.text,
    minHeight: "100vh",
    fontFamily: theme.fonts?.body ? `"${theme.fonts.body}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` : "sans-serif",
    "--store-primary": c.primary,
    "--store-secondary": c.secondary,
    "--store-accent": c.accent,
    "--store-bg": c.background,
    "--store-surface": c.surface,
    "--store-text": c.text,
    "--store-muted": c.mutedText,
  };

  return (
    <div style={styleObj} className="w-full min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
      {children}
    </div>
  );
}
