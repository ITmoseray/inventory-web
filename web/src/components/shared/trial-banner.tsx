"use client";

import { useSession } from "next-auth/react";
import { Info, X, CreditCard, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export function TrialBanner() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-[#FFF9E5] border-b border-amber-100 px-6 py-3 flex items-center justify-between transition-all">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Info className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <p className="text-sm font-bold text-slate-800">
            Your premium trial plan ends today.
          </p>
          <div className="hidden sm:block h-3 w-px bg-slate-200" />
          <Link href="/pricing" className="text-sm font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
            Subscribe Now <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1.5 hover:bg-amber-200/50 rounded-full transition-colors text-amber-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
