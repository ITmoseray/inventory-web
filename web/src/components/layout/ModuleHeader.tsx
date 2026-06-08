"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  label?: string;
}

export function BackButton({ className, label = "Back" }: BackButtonProps) {
  const router = useRouter();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-11 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-slate-100 dark:hover:bg-slate-800", className)}
      onClick={() => router.back()}
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}

interface ModuleHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function ModuleHeader({ title, description, actions }: ModuleHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{title}</h1>
          {description && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
