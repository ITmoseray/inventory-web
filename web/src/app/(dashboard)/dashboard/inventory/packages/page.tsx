"use client";

import { useState } from "react";
import { 
  Package, 
  Plus, 
  Truck, 
  ArrowRight, 
  Info, 
  Box,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function PackagesPage() {
  const router = useRouter();
  const [hasData] = useState(false);
  const [activeCycleStep, setActiveCycleStep] = useState(0);

  const PACKAGE_CYCLE = [
    { title: "Confirmed Order", desc: "A package can only be created from a sales order that is in 'Confirmed' status." },
    { title: "Pack Items", desc: "Select the items and quantities you want to pack for the specific shipment." },
    { title: "Create Package", desc: "Generate a unique package slip and assign tracking information." },
    { title: "Ship & Track", desc: "Hand over to carrier and monitor delivery status in real-time." }
  ];

  if (!hasData) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto custom-scrollbar">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full text-center space-y-16 py-12"
        >
          {/* Main Visual Header */}
          <div className="space-y-8">
            <div className="relative mx-auto w-32 h-32">
               <div className="absolute inset-0 bg-indigo-600 rounded-[2rem] -rotate-6 opacity-10" />
               <div className="relative h-full w-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl flex items-center justify-center">
                  <Box className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
               </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                Start Creating <span className="text-indigo-600">Packages!</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xl leading-relaxed max-w-lg mx-auto">
                Create packages and ship them via your preferred carrier. Streamline your fulfillment pipeline today.
              </p>
            </div>
            <Button 
               onClick={() => router.push("/dashboard/inventory/packages/new")}
               className="h-18 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.05] active:scale-95 group"
             >
                <Plus className="mr-4 h-6 w-6 group-hover:scale-125 transition-transform" />
                New Package
             </Button>
          </div>

          {/* Life Cycle Interaction Node */}
          <div className="space-y-10">
             <div className="flex flex-col items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-indigo-600">Life cycle of a Package</h3>
                <div className="h-1 w-12 bg-indigo-600 rounded-full" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 hidden md:block" />
                
                {PACKAGE_CYCLE.map((step, i) => (
                  <div 
                    key={i} 
                    onMouseEnter={() => setActiveCycleStep(i)}
                    className={cn(
                      "relative z-10 p-6 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer group",
                      activeCycleStep === i 
                        ? "bg-white dark:bg-slate-900 border-indigo-600 shadow-xl" 
                        : "bg-slate-50/50 dark:bg-slate-800/30 border-transparent hover:border-slate-200"
                    )}
                  >
                     <div className={cn(
                       "h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-500",
                       activeCycleStep === i ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600"
                     )}>
                        {i === 0 && <FileText className="h-5 w-5" />}
                        {i === 1 && <Box className="h-5 w-5" />}
                        {i === 2 && <Plus className="h-5 w-5" />}
                        {i === 3 && <Truck className="h-5 w-5" />}
                     </div>
                     <h4 className={cn(
                       "text-[10px] font-black uppercase tracking-widest text-left",
                       activeCycleStep === i ? "text-slate-900 dark:text-white" : "text-slate-400"
                     )}>{step.title}</h4>
                  </div>
                ))}
             </div>

             <div className="p-10 rounded-[2.5rem] bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/50 text-left animate-in fade-in zoom-in-95 duration-500">
                <div className="flex gap-6 items-start">
                   <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                      <Info className="h-6 w-6" />
                   </div>
                   <div className="space-y-4">
                      <p className="text-slate-600 dark:text-slate-300 font-medium text-lg leading-relaxed">
                        In the <span className="text-indigo-600 font-black">Packages module</span>, you can:
                      </p>
                      <ul className="space-y-3">
                         <li className="flex gap-3 text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                            A package can only be created from a sales order that is in <span className="text-slate-900 dark:text-white">'Confirmed'</span> status.
                         </li>
                         <li className="flex gap-3 text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight italic pl-8">
                            Note: If created for a 'Draft' order, the order automatically updates to 'Confirmed'.
                         </li>
                      </ul>
                      <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all mt-4" onClick={() => router.push("/dashboard/help")}>
                        Learn More <ExternalLink className="h-3 w-3" />
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8">
       <h1>Packages Inventory</h1>
    </div>
  );
}
