"use client";

import { useSidebarStore } from "@/store/use-sidebar-store";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

const COLORS = [
  { name: "Obsidian", class: "bg-slate-950", hex: "#020617" },
  { name: "Navy", class: "bg-slate-900", hex: "#0f172a" },
  { name: "Midnight", class: "bg-indigo-950", hex: "#1e1b4b" },
  { name: "Forest", class: "bg-emerald-950", hex: "#022c22" },
  { name: "Crimson", class: "bg-rose-950", hex: "#4c0519" },
  { name: "Plum", class: "bg-purple-950", hex: "#3b0764" },
];

export function SidebarColorPicker() {
  const { colorHex, setColorHex } = useSidebarStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center w-full px-2 py-1.5 text-sm outline-none transition-colors focus:bg-slate-100 hover:bg-slate-100 dark:focus:bg-slate-800 dark:hover:bg-slate-800 rounded-sm cursor-pointer">
        <Paintbrush className="mr-3 size-4 text-slate-400" />
        Sidebar Theme
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-48 rounded-2xl border-slate-100 dark:border-slate-800 p-2 shadow-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">
            Select Color
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800 mb-2" />
        <div className="grid grid-cols-3 gap-2 p-1">
          {COLORS.map((color) => (
            <DropdownMenuItem
              key={color.name}
              className="flex flex-col items-center gap-1 group cursor-pointer focus:bg-transparent"
              onSelect={() => setColorHex(color.hex, color.class)}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all group-hover:scale-110",
                  colorHex === color.hex ? "border-primary shadow-sm shadow-primary/30" : "border-transparent"
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
