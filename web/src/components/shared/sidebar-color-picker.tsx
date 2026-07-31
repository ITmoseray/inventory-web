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
  const { colorHex, setColor } = useSidebarStore();

  return (
    <div className="px-4 py-3 border-t border-white/10 mt-2">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5">
        Sidebar Color
      </p>
      <div className="flex flex-wrap gap-2">
        {COLORS.map((color) => (
          <button
            key={color.name}
            type="button"
            title={color.name}
            onClick={() => setColor(color.hex, color.hsl)}
            className={cn(
              "h-6 w-6 rounded-full border-2 transition-all duration-200 hover:scale-125 focus:outline-none",
              colorHex === color.hex
                ? "border-primary scale-125 shadow-md shadow-primary/40"
                : "border-white/20 hover:border-white/60"
            )}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
    </div>
  );
}
