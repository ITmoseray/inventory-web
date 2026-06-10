"use client";

import { Info, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-indigo-600 text-white py-4 px-6 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-full bg-white/10 -skew-x-12 translate-x-32" />
      
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-black uppercase tracking-widest">Demo Account</h4>
            <p className="text-xs font-medium text-indigo-100 max-w-2xl leading-snug">
              Experience how Protech Inventory OS works before you sign up. Actions in this account are limited. 
              <span className="hidden sm:inline"> Sign up for a free trial to access all enterprise features.</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/register">
            <Button variant="secondary" className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all">
              Start Free Trial
            </Button>
          </Link>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
