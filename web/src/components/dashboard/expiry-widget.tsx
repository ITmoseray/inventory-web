"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CalendarClock, PackageOpen } from "lucide-react";
import { getExpiringProducts } from "@/lib/actions/product";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ExpiryWidget() {
  const [expiring, setExpiring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getExpiringProducts(30); // 30 days threshold
        setExpiring(data || []);
      } catch (error) {
        console.error("Failed to fetch expiring products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  if (expiring.length === 0) {
    return (
      <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <CalendarClock size={24} />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Expiring Soon</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest">Next 30 Days</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 flex-1">
          <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
             <PackageOpen size={32} className="text-emerald-300 dark:text-emerald-700" />
          </div>
          <p className="text-sm font-black text-slate-600 dark:text-slate-400">All inventory is fresh.</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">No items expiring soon.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col h-full relative">
      <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
         <AlertCircle size={120} className="text-rose-500" />
      </div>
      <CardHeader className="relative z-10 border-b border-slate-100 dark:border-slate-800/50 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl relative">
              <CalendarClock size={24} />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-rose-500 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-rose-500 rounded-full" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Expiring Soon</CardTitle>
              <CardDescription className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Requires Action</CardDescription>
            </div>
          </div>
          <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border-none font-black text-lg px-3 py-1">
             {expiring.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 p-0 flex-1 overflow-y-auto custom-scrollbar">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {expiring.map((product) => {
             const days = product.daysUntilExpiry;
             const isCritical = days <= 7;
             
             return (
               <div key={product.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">
                      {product.stockQuantity} in stock
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={cn(
                       "font-black text-[10px] uppercase tracking-widest border-0",
                       isCritical ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                    )}>
                       {days <= 0 ? "Expired" : `${days} Days`}
                    </Badge>
                    <span className="text-[9px] font-bold text-slate-400">
                      {format(new Date(product.expiryDate), "MMM dd, yyyy")}
                    </span>
                  </div>
               </div>
             );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
