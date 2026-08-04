"use client";

import { useEffect } from "react";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { cn } from "@/lib/utils";

const COLORS = [
  // Darks
  { name: "Obsidian",   hex: "#020617", hsl: "222.2 84% 2%"      },
  { name: "Navy",       hex: "#0f172a", hsl: "222.2 47.4% 11.2%" },
  { name: "Graphite",   hex: "#18181b", hsl: "240 5.9% 10%"      },
  { name: "Midnight",   hex: "#1e1b4b", hsl: "243.7 75.4% 19.8%" },
  { name: "Plum",       hex: "#3b0764", hsl: "270.7 90.8% 21.2%" },
  { name: "Forest",     hex: "#022c22", hsl: "161.4 89.5% 8.6%"  },
  { name: "Crimson",    hex: "#4c0519", hsl: "343.1 86.5% 15.9%" },
  { name: "Ocean",      hex: "#0c1a2e", hsl: "213.8 57.9% 11.8%" },
  { name: "Cocoa",      hex: "#2c1a0e", hsl: "28 60% 11.8%"      },
  // Rich tones
  { name: "Indigo",     hex: "#1e1b6b", hsl: "242 57% 27%"       },
  { name: "Teal",       hex: "#0d3331", hsl: "178 60% 12%"       },
  { name: "Jade",       hex: "#064e3b", hsl: "161 79% 17%"       },
  { name: "Burgundy",   hex: "#4a0d1c", hsl: "345 72% 17%"       },
  { name: "Slate",      hex: "#1e293b", hsl: "215 28% 17%"       },
  { name: "Copper",     hex: "#431407", hsl: "15 77% 15%"        },
  { name: "Violet",     hex: "#2e1065", hsl: "263 87% 23%"       },
  { name: "Sapphire",   hex: "#1e3a5f", hsl: "211 51% 24%"       },
  // Lights & Whites
  { name: "White",      hex: "#ffffff", hsl: "0 0% 100%"         },
  { name: "Snow",       hex: "#f8fafc", hsl: "210 40% 98%"       },
  { name: "Pearl",      hex: "#f1f5f9", hsl: "210 40% 96%"       },
  { name: "Ivory",      hex: "#fefce8", hsl: "55 92% 95%"        },
  { name: "Lavender",   hex: "#ede9fe", hsl: "250 100% 96%"      },
  { name: "Blush",      hex: "#fdf2f8", hsl: "313 100% 97%"      },
  { name: "Mint",       hex: "#ecfdf5", hsl: "152 81% 96%"       },
  { name: "Sky",        hex: "#f0f9ff", hsl: "204 100% 97%"      },
  // Vibrant mid-tones
  { name: "Rose Gold",  hex: "#9f4761", hsl: "340 38% 45%"       },
  { name: "Amber",      hex: "#78350f", hsl: "33 92% 26%"        },
  { name: "Coral",      hex: "#7f1d1d", hsl: "0 65% 30%"         },
  { name: "Emerald",    hex: "#065f46", hsl: "161 69% 20%"       },
  { name: "Steel",      hex: "#334155", hsl: "215 25% 27%"       },
  { name: "Dusk",       hex: "#4c1d95", hsl: "263 77% 35%"       },
];

export function SidebarColorPicker() {
  const { colorHex, colorHsl, setColor } = useSidebarStore();

  // Apply color globally to document root so ALL sidebar instances pick it up
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar', `hsl(${colorHsl})`);
    document.documentElement.style.setProperty('--sidebar-theme-bg', colorHex);
  }, [colorHex, colorHsl]);

  return (
    <div className="px-3 py-2 space-y-1.5">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/30 px-0.5">
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
                : "ring-1 ring-black/10 dark:ring-white/10 hover:ring-white/40",
              // White/light colors need a visible border so they show up on light backgrounds
              (color.hex === "#ffffff" || color.hex === "#f8fafc" || color.hex === "#f1f5f9" || color.hex === "#fefce8" || color.hex === "#ede9fe" || color.hex === "#fdf2f8" || color.hex === "#ecfdf5" || color.hex === "#f0f9ff")
                ? "ring-1 ring-slate-300 dark:ring-slate-600"
                : ""
            )}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
    </div>
  );
}
