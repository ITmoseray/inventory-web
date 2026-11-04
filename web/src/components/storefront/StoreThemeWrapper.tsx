"use client";

import React, { createContext, useContext } from "react";
import { StoreTheme, normalizeStoreTheme } from "@/types/store-builder";

export type StoreViewport = "desktop" | "tablet" | "mobile";

export const StoreViewportContext = createContext<StoreViewport>("desktop");

export function useStoreViewport(): StoreViewport {
  return useContext(StoreViewportContext);
}

interface Props {
  theme?: any;
  viewport?: StoreViewport;
  children: React.ReactNode;
}

export function StoreThemeWrapper({ theme: rawTheme, viewport = "desktop", children }: Props) {
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

  const isMobile = viewport === "mobile";
  const isTablet = viewport === "tablet";

  return (
    <StoreViewportContext.Provider value={viewport}>
      <div 
        style={styleObj} 
        data-viewport={viewport}
        className={`w-full min-h-screen overflow-x-hidden relative antialiased selection:bg-indigo-500 selection:text-white ${
          isMobile ? "is-simulator-mobile max-w-[390px] mx-auto" : isTablet ? "is-simulator-tablet max-w-[768px] mx-auto" : ""
        }`}
      >
        {/* Scoped CSS reset to guarantee mobile preview fidelity against desktop media queries */}
        {isMobile && (
          <style dangerouslySetInnerHTML={{ __html: `
            .is-simulator-mobile {
              max-width: 390px !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
            .is-simulator-mobile * {
              box-sizing: border-box !important;
            }
            /* Suppress desktop navigation bar collisions */
            .is-simulator-mobile nav.hidden.md\\:flex,
            .is-simulator-mobile nav.md\\:flex {
              display: none !important;
            }
            /* Force mobile hamburger visibility */
            .is-simulator-mobile .md\\:hidden {
              display: flex !important;
            }
            /* Constrain desktop 4-column product grids to neat 2 columns */
            .is-simulator-mobile .grid-cols-4, 
            .is-simulator-mobile .lg\\:grid-cols-4,
            .is-simulator-mobile .md\\:grid-cols-4,
            .is-simulator-mobile .sm\\:grid-cols-3 {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 0.625rem !important;
            }
            /* Collapse 12-column and 2-column split layouts in hero, about, and promo sections */
            .is-simulator-mobile .lg\\:grid-cols-12,
            .is-simulator-mobile .lg\\:grid-cols-2,
            .is-simulator-mobile .md\\:grid-cols-2 {
              grid-template-columns: 1fr !important;
              gap: 1.25rem !important;
            }
            .is-simulator-mobile .lg\\:col-span-7,
            .is-simulator-mobile .lg\\:col-span-5 {
              grid-column: span 1 / span 1 !important;
            }
            .is-simulator-mobile .hidden.lg\\:flex {
              display: none !important;
            }
            /* Constrain desktop container paddings that exceed mobile screen width */
            .is-simulator-mobile .sm\\:p-12,
            .is-simulator-mobile .lg\\:p-16 {
              padding: 1.25rem !important;
            }
            .is-simulator-mobile .sm\\:px-6,
            .is-simulator-mobile .lg\\:px-8 {
              padding-left: 0.875rem !important;
              padding-right: 0.875rem !important;
            }
            /* Prevent desktop 6xl font overflow */
            .is-simulator-mobile .lg\\:text-6xl,
            .is-simulator-mobile .md\\:text-6xl,
            .is-simulator-mobile .sm\\:text-5xl {
              font-size: 1.65rem !important;
              line-height: 1.15 !important;
            }
            /* Fix horizontal flex rows */
            .is-simulator-mobile .md\\:flex-row {
              flex-direction: column !important;
            }
            /* Multi-column footers */
            .is-simulator-mobile footer .md\\:grid-cols-4 {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          ` }} />
        )}
        {children}
      </div>
    </StoreViewportContext.Provider>
  );
}
