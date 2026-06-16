"use client";

import { useSession } from "next-auth/react";
import { Info, X, CreditCard, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";

export function TrialBanner() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (session?.user?.trialEndDate) {
        const end = new Date(session.user.trialEndDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        setDaysLeft(days);
    }
  }, [session]);

  if (!isVisible || !session?.user?.trialEndDate) return null;

  const isExpired = daysLeft !== null && daysLeft <= 0;

  return (
    <div className={cn(
        "w-full px-6 py-3 flex items-center justify-between transition-all border-b",
        isExpired ? "bg-rose-50 border-rose-100" : "bg-[#FFF9E5] border-amber-100"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
            isExpired ? "bg-rose-100" : "bg-amber-100"
        )}>
          <Info className={cn("h-4 w-4", isExpired ? "text-rose-600" : "text-amber-600")} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <p className="text-sm font-bold text-slate-800">
            {isExpired 
              ? "Your premium trial plan has expired." 
              : `Your premium trial plan ends in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}.`
            }
          </p>
          <div className="hidden sm:block h-3 w-px bg-slate-200" />
          <Link href="/pricing" className="text-sm font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
            {isExpired ? "Upgrade Now" : "Subscribe Now"} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsVisible(false)}
          className={cn(
            "p-1.5 rounded-full transition-colors",
            isExpired ? "hover:bg-rose-200/50 text-rose-600" : "hover:bg-amber-200/50 text-amber-600"
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
