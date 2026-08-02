"use client";

import { useSidebarStore } from "@/store/use-sidebar-store";
import { cn } from "@/lib/utils";

const COLORS = [
  { name: "Navy",     hex: "#0f172a", hsl: "222.2 47.4% 11.2%" },
  { name: "Obsidian", hex: "#020617", hsl: "222.2 84% 2%" },
  { name: "Midnight", hex: "#1e1b4b", hsl: "243.7 75.4% 19.8%" },
  { name: "Forest",   hex: "#022c22", hsl: "161.4 89.5% 8.6%" },
  { name: "Crimson",  hex: "#4c0519", hsl: "343.1 86.5% 15.9%" },
  { name: "Plum",     hex: "#3b0764", hsl: "270.7 90.8% 21.2%" },
  { name: "Graphite", hex: "#18181b", hsl: "240 5.9% 10%" },
  { name: "Ocean",    hex: "#0c1a2e", hsl: "213.8 57.9% 11.8%" },
  { name: "Cocoa",    hex: "#2c1a0e", hsl: "28 60% 11.8%" },
];

export function SidebarColorPicker() {
  const { colorHex, colorHsl, setColor } = useSidebarStore();

  // Apply color globally to document root so ALL sidebar instances pick it up
  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar', `hsl(${colorHsl})`);
    document.documentElement.style.setProperty('--sidebar-theme-bg', colorHex);
  }, [colorHex, colorHsl]);

  return (
    <div className="px-3 py-1 flex items-center gap-1">
      {COLORS.map((color) => (
        <button
          key={color.name}
          type="button"
          title={color.name}
          onClick={() => setColor(color.hex, color.hsl)}
          className={cn(
            "h-3 w-3 rounded-full border transition-all duration-150 hover:scale-125 focus:outline-none",
            colorHex === color.hex
              ? "border-primary scale-125 shadow shadow-primary/50"
              : "border-transparent hover:border-white/40"
          )}
          style={{ backgroundColor: color.hex }}
        />
      ))}
    </div>
  );
}
