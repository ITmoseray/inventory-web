import { cn } from "@/lib/utils";
import React from "react";

interface TouchWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function TouchWrapper({ children, className }: TouchWrapperProps) {
  return (
    <div className={cn("min-h-[44px] flex items-center gap-2", className)}>
      {children}
    </div>
  );
}
