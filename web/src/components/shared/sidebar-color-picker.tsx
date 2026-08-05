"use client";

import { useEffect, useState } from "react";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Paintbrush } from "lucide-react";

const COLORS = [
  // Darks
  { name: "Obsidian",  hex: "#020617", hsl: "222.2 84% 2%",       light: false, group: "Darks" },
  { name: "Navy",      hex: "#0f172a", hsl: "222.2 47.4% 11.2%",  light: false, group: "Darks" },
  { name: "Graphite",  hex: "#18181b", hsl: "240 5.9% 10%",        light: false, group: "Darks" },
  { name: "Midnight",  hex: "#1e1b4b", hsl: "243.7 75.4% 19.8%",  light: false, group: "Darks" },
  { name: "Plum",      hex: "#3b0764", hsl: "270.7 90.8% 21.2%",  light: false, group: "Darks" },
  { name: "Forest",    hex: "#022c22", hsl: "161.4 89.5% 8.6%",   light: false, group: "Darks" },
  { name: "Crimson",   hex: "#4c0519", hsl: "343.1 86.5% 15.9%",  light: false, group: "Darks" },
  { name: "Ocean",     hex: "#0c1a2e", hsl: "213.8 57.9% 11.8%",  light: false, group: "Darks" },
  { name: "Cocoa",     hex: "#2c1a0e", hsl: "28 60% 11.8%",        light: false, group: "Darks" },
  // Rich tones
  { name: "Indigo",    hex: "#1e1b6b", hsl: "242 57% 27%",         light: false, group: "Rich Tones" },
  { name: "Teal",      hex: "#0d3331", hsl: "178 60% 12%",         light: false, group: "Rich Tones" },
  { name: "Jade",      hex: "#064e3b", hsl: "161 79% 17%",         light: false, group: "Rich Tones" },
  { name: "Burgundy",  hex: "#4a0d1c", hsl: "345 72% 17%",         light: false, group: "Rich Tones" },
  { name: "Slate",     hex: "#1e293b", hsl: "215 28% 17%",         light: false, group: "Rich Tones" },
  { name: "Copper",    hex: "#431407", hsl: "15 77% 15%",           light: false, group: "Rich Tones" },
  { name: "Violet",    hex: "#2e1065", hsl: "263 87% 23%",         light: false, group: "Rich Tones" },
  { name: "Sapphire",  hex: "#1e3a5f", hsl: "211 51% 24%",         light: false, group: "Rich Tones" },
  // Lights & Whites
  { name: "White",     hex: "#ffffff", hsl: "0 0% 100%",           light: true,  group: "Lights & Whites" },
  { name: "Snow",      hex: "#f8fafc", hsl: "210 40% 98%",         light: true,  group: "Lights & Whites" },
  { name: "Pearl",     hex: "#f1f5f9", hsl: "210 40% 96%",         light: true,  group: "Lights & Whites" },
  { name: "Ivory",     hex: "#fefce8", hsl: "55 92% 95%",          light: true,  group: "Lights & Whites" },
  { name: "Lavender",  hex: "#ede9fe", hsl: "250 100% 96%",        light: true,  group: "Lights & Whites" },
  { name: "Blush",     hex: "#fdf2f8", hsl: "313 100% 97%",        light: true,  group: "Lights & Whites" },
  { name: "Mint",      hex: "#ecfdf5", hsl: "152 81% 96%",         light: true,  group: "Lights & Whites" },
  { name: "Sky",       hex: "#f0f9ff", hsl: "204 100% 97%",        light: true,  group: "Lights & Whites" },
  // Vibrant mid-tones
  { name: "Rose Gold", hex: "#9f4761", hsl: "340 38% 45%",         light: false, group: "Vibrant Mid-tones" },
  { name: "Amber",     hex: "#78350f", hsl: "33 92% 26%",          light: false, group: "Vibrant Mid-tones" },
  { name: "Coral",     hex: "#7f1d1d", hsl: "0 65% 30%",           light: false, group: "Vibrant Mid-tones" },
  { name: "Emerald",   hex: "#065f46", hsl: "161 69% 20%",         light: false, group: "Vibrant Mid-tones" },
  { name: "Steel",     hex: "#334155", hsl: "215 25% 27%",         light: false, group: "Vibrant Mid-tones" },
  { name: "Dusk",      hex: "#4c1d95", hsl: "263 77% 35%",         light: false, group: "Vibrant Mid-tones" },
];

const GROUPS = ["Darks", "Rich Tones", "Lights & Whites", "Vibrant Mid-tones"];

// CSS variables to apply for dark sidebar backgrounds (white text)
const DARK_THEME_VARS: Record<string, string> = {
  "--sidebar-foreground":          "hsl(210 40% 98%)",
  "--sidebar-primary":             "hsl(221 83% 53%)",
  "--sidebar-primary-foreground":  "hsl(210 40% 98%)",
  "--sidebar-accent":              "hsl(0 0% 100% / 0.08)",
  "--sidebar-accent-foreground":   "hsl(210 40% 98%)",
  "--sidebar-border":              "hsl(0 0% 100% / 0.15)",
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  const handleValueChange = (value: string) => {
    const selectedColor = COLORS.find(c => c.hex === value);
    if (selectedColor) {
      setColor(selectedColor.hex, selectedColor.hsl);
    }
  };

  return (
    <div className="px-3 py-2 space-y-1">
      <p className="text-[10px] font-black uppercase tracking-wider text-sidebar-foreground/50 px-1">
        Color Theme
      </p>
      <Select value={colorHex} onValueChange={handleValueChange}>
        <SelectTrigger className="h-8 w-full bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent transition-colors shadow-none text-xs focus:ring-1 focus:ring-sidebar-ring">
          <div className="flex items-center gap-2">
            <Paintbrush className="h-3.5 w-3.5 text-sidebar-foreground/70" />
            <SelectValue placeholder="Select a theme color">
              {COLORS.find(c => c.hex === colorHex)?.name || "Select a theme color"}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {GROUPS.map((group) => (
            <SelectGroup key={group}>
              <SelectLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider pt-2">
                {group}
              </SelectLabel>
              {COLORS.filter(c => c.group === group).map((color) => (
                <SelectItem key={color.name} value={color.hex} className="text-sm cursor-pointer hover:bg-accent/50 focus:bg-accent">
                  <div className="flex items-center gap-2.5 w-full">
                    <div 
                      className={cn(
                        "h-3.5 w-3.5 rounded-full border shadow-sm",
                        (color.hex === "#ffffff" || color.hex === "#f8fafc" || color.hex === "#f1f5f9" || color.hex === "#fefce8" || color.hex === "#ede9fe" || color.hex === "#fdf2f8" || color.hex === "#ecfdf5" || color.hex === "#f0f9ff")
                        ? "border-slate-300 dark:border-slate-600"
                        : "border-black/10 dark:border-white/10"
                      )}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="font-medium">{color.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
