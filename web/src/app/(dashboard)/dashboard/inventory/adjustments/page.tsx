"use client";

import { useState } from "react";
import { 
  Package, 
  Plus, 
  History, 
  ArrowRight, 
  Info, 
  AlertCircle,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/layout/ModuleHeader";

export default function InventoryAdjustmentsPage() {
  const router = useRouter();
  const [hasData] = useState(false); // Toggle to show empty state

  if (!hasData) {
    return (
      <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-[calc(100vh-120px)]">
        <div className="flex items-center">
          <BackButton />
        </div>
        <div className="flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full text-center space-y-12"
          >
          {/* Animated Illustration Node */}
          <div className="relative mx-auto w-40 h-40">
             <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] rotate-12 opacity-10 animate-pulse" />
             <div className="relative h-full w-full bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl flex items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <RefreshCw className="h-16 w-16 text-indigo-600 dark:text-indigo-400 relative z-10 transition-transform duration-700 group-hover:rotate-180" />
             </div>
             <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-emerald-500 rounded-2xl border-4 border-white dark:border-slate-950 flex items-center justify-center text-white shadow-xl z-20">
                <CheckCircle2 className="h-6 w-6" />
             </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-tight">
              Keep Your Inventory <span className="text-indigo-600">Accurate</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-md mx-auto">
              Adjust your inventory to ensure accurate quantity and value. Manage stock discrepancies with precision.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
             <Button 
               onClick={() => router.push("/dashboard/inventory/adjustments/new")}
               className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.05] active:scale-95 group"
             >
                <Plus className="mr-3 h-5 w-5 group-hover:scale-125 transition-transform" />
                Create Adjustment
             </Button>
             <Button
               variant="outline"
               className="h-16 px-10 rounded-2xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all"
               onClick={() => { /* Logic to show history, e.g., setHasData(true) or router.push */ }}
             >
                <History className="mr-3 h-4 w-4" /> View History
             </Button>

          </div>

          {/* Quick Help Node */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-12 border-t border-slate-100 dark:border-slate-800">
             <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 group hover:border-indigo-600/20 transition-all">
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 mb-4">
                   <AlertCircle className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">Quantity Adjustments</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">Update stock levels due to damage, loss, or physical count discrepancies.</p>
             </div>
             <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 group hover:border-indigo-600/20 transition-all">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 mb-4">
                   <BarChart3 className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">Value Adjustments</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">Revaluate your inventory based on market price changes or bulk purchase costs.</p>
             </div>
          </div>
        </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
       <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Inventory Adjustments List</h1>
       </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
