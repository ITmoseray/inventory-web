"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function GlobalThemeToggle() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Never render floating theme button on dashboard, super-admin, demo, or auth pages
  // (Theme controls are seamlessly integrated into the Header and Sidebar)
  if (
    pathname?.startsWith("/dashboard") || 
    pathname?.startsWith("/super-admin") || 
    pathname?.startsWith("/demo") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register")
  ) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 rounded-full shadow-lg border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md hover:scale-105 transition-all"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title="Toggle Light/Dark Theme"
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
}
