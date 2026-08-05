"use client";

import { useEffect } from "react";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { cn } from "@/lib/utils";

const COLORS = [
  // Darks
  { name: "Obsidian",  hex: "#020617", hsl: "222.2 84% 2%",       light: false },
  { name: "Navy",      hex: "#0f172a", hsl: "222.2 47.4% 11.2%",  light: false },
  { name: "Graphite",  hex: "#18181b", hsl: "240 5.9% 10%",        light: false },
  { name: "Midnight",  hex: "#1e1b4b", hsl: "243.7 75.4% 19.8%",  light: false },
  { name: "Plum",      hex: "#3b0764", hsl: "270.7 90.8% 21.2%",  light: false },
  { name: "Forest",    hex: "#022c22", hsl: "161.4 89.5% 8.6%",   light: false },
  { name: "Crimson",   hex: "#4c0519", hsl: "343.1 86.5% 15.9%",  light: false },
  { name: "Ocean",     hex: "#0c1a2e", hsl: "213.8 57.9% 11.8%",  light: false },
  { name: "Cocoa",     hex: "#2c1a0e", hsl: "28 60% 11.8%",        light: false },
  // Rich tones
  { name: "Indigo",    hex: "#1e1b6b", hsl: "242 57% 27%",         light: false },
  { name: "Teal",      hex: "#0d3331", hsl: "178 60% 12%",         light: false },
  { name: "Jade",      hex: "#064e3b", hsl: "161 79% 17%",         light: false },
  { name: "Burgundy",  hex: "#4a0d1c", hsl: "345 72% 17%",         light: false },
  { name: "Slate",     hex: "#1e293b", hsl: "215 28% 17%",         light: false },
  { name: "Copper",    hex: "#431407", hsl: "15 77% 15%",           light: false },
  { name: "Violet",    hex: "#2e1065", hsl: "263 87% 23%",         light: false },
  { name: "Sapphire",  hex: "#1e3a5f", hsl: "211 51% 24%",         light: false },
  // Lights & Whites
  { name: "White",     hex: "#ffffff", hsl: "0 0% 100%",           light: true  },
  { name: "Snow",      hex: "#f8fafc", hsl: "210 40% 98%",         light: true  },
  { name: "Pearl",     hex: "#f1f5f9", hsl: "210 40% 96%",         light: true  },
  { name: "Ivory",     hex: "#fefce8", hsl: "55 92% 95%",          light: true  },
  { name: "Lavender",  hex: "#ede9fe", hsl: "250 100% 96%",        light: true  },
  { name: "Blush",     hex: "#fdf2f8", hsl: "313 100% 97%",        light: true  },
  { name: "Mint",      hex: "#ecfdf5", hsl: "152 81% 96%",         light: true  },
  { name: "Sky",       hex: "#f0f9ff", hsl: "204 100% 97%",        light: true  },
  // Vibrant mid-tones
  { name: "Rose Gold", hex: "#9f4761", hsl: "340 38% 45%",         light: false },
  { name: "Amber",     hex: "#78350f", hsl: "33 92% 26%",          light: false },
  { name: "Coral",     hex: "#7f1d1d", hsl: "0 65% 30%",           light: false },
  { name: "Emerald",   hex: "#065f46", hsl: "161 69% 20%",         light: false },
  { name: "Steel",     hex: "#334155", hsl: "215 25% 27%",         light: false },
  { name: "Dusk",      hex: "#4c1d95", hsl: "263 77% 35%",         light: false },
];

// CSS variables to apply for dark sidebar backgrounds (white text)
const DARK_THEME_VARS: Record<string, string> = {
  "--sidebar-foreground":          "hsl(210 40% 98%)",
  "--sidebar-primary":             "hsl(221 83% 53%)",
  "--sidebar-primary-foreground":  "hsl(210 40% 98%)",
  "--sidebar-accent":              "hsl(0 0% 100% / 0.08)",
  "--sidebar-accent-foreground":   "hsl(210 40% 98%)",
  "--sidebar-border":              "hsl(0 0% 100% / 0.08)",
  "--sidebar-ring":                "hsl(221 83% 53%)",
};

// CSS variables to apply for light sidebar backgrounds (dark text)
const LIGHT_THEME_VARS: Record<string, string> = {
  "--sidebar-foreground":          "hsl(222 47% 11%)",
  "--sidebar-primary":             "hsl(221 83% 40%)",
  "--sidebar-primary-foreground":  "hsl(0 0% 100%)",
  "--sidebar-accent":              "hsl(0 0% 0% / 0.06)",
  "--sidebar-accent-foreground":   "hsl(222 47% 11%)",
  "--sidebar-border":              "hsl(0 0% 0% / 0.15)",
  "--sidebar-ring":                "hsl(221 83% 40%)",
};

export function SidebarColorPicker() {
  const { colorHex, colorHsl, setColor } = useSidebarStore();

  // Find if the current color is a light one
  const currentColor = COLORS.find(c => c.hex === colorHex);
  const isLight = currentColor?.light ?? false;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sidebar", `hsl(${colorHsl})`);
    root.style.setProperty("--sidebar-theme-bg", colorHex);

    // Apply matching foreground/accent vars based on light vs dark
    const vars = isLight ? LIGHT_THEME_VARS : DARK_THEME_VARS;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [colorHex, colorHsl, isLight]);

  return (
    <div className="px-3 py-2 space-y-1.5">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/50 px-0.5">
        Sidebar Color
      </p>
      <div className="flex flex-wrap gap-1.5">
        {COLORS.map((color) => (
          <button
            key={color.name}
            type="button"
            title={color.name}
            onClick={() => setColor(color.hex, color.hsl)}
            className={cn(
              "h-4 w-4 rounded-full transition-all duration-150 hover:scale-125 focus:outline-none",
              colorHex === color.hex
                ? "ring-2 ring-offset-1 ring-primary scale-125 shadow-md"
                : "ring-1 ring-black/10 dark:ring-white/10 hover:ring-black/30 dark:hover:ring-white/40",
              color.light && colorHex !== color.hex
                ? "ring-1 ring-slate-300 dark:ring-slate-500"
                : ""
            )}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
    </div>
  );
}
