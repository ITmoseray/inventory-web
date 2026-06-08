import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface LowStockBadgeProps {
  status: "LOW" | "CRITICAL" | "OK";
  stockQuantity: number;
  className?: string;
}

export const LowStockBadge = React.memo(({ status, stockQuantity, className }: LowStockBadgeProps) => {
  if (status === "OK") return null;

  const variant = status === "CRITICAL" ? "destructive" : "warning";
  
  return (
    <Badge 
      variant={variant} 
      className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest",
        status === "CRITICAL" && "bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200",
        status === "LOW" && "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
        className
      )}
    >
      <AlertCircle className="h-3 w-3" />
      {status === "CRITICAL" ? "Critical" : "Low Stock"} ({stockQuantity})
    </Badge>
  );
});

LowStockBadge.displayName = "LowStockBadge";
