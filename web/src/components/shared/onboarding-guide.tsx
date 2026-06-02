"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Sparkles, Zap, Cpu, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function OnboardingGuide() {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTour } = useOnboardingStore();
  const { data: session } = useSession();
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isActive || !isMounted) return;

    const updateCoords = () => {
      const step = steps[currentStep];
      if (step.position === 'center') {
        setCoords({ top: window.innerHeight / 2 - 120, left: window.innerWidth / 2 - 200, width: 400, height: 240 });
        return;
      }

      const element = document.getElementById(step.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Small delay to allow elements to render/sidebar to expand if needed
    const timeout = setTimeout(updateCoords, 100);
    window.addEventListener('resize', updateCoords);
    return () => {
      window.removeEventListener('resize', updateCoords);
      clearTimeout(timeout);
    };
  }, [isActive, currentStep, steps, isMounted]);

  if (!isActive || !isMounted) return null;

  const current = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const userName = session?.user?.name?.split(' ')[0] || "User";

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden font-sans selection:bg-indigo-600/10 selection:text-indigo-600">
      {/* Dimmed Overlay with Spotlight Hole */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 pointer-events-auto backdrop-blur-[2px]"
        style={{
          clipPath: current.position === 'center' 
            ? 'none' 
            : `polygon(0% 0%, 0% 100%, ${coords.left - 10}px 100%, ${coords.left - 10}px ${coords.top - 10}px, ${coords.left + coords.width + 10}px ${coords.top - 10}px, ${coords.left + coords.width + 10}px ${coords.top + coords.height + 10}px, ${coords.left - 10}px ${coords.top + coords.height + 10}px, ${coords.left - 10}px 100%, 100% 100%, 100% 0%)`
        }}
      />

      {/* Floating Guide Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -30 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={cn(
            "absolute pointer-events-auto w-[400px] bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] border border-indigo-100 dark:border-indigo-900/50 overflow-hidden",
            current.position === 'center' && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          )}
          style={current.position !== 'center' ? {
            top: current.position === 'bottom' ? coords.top + coords.height + 30 : current.position === 'top' ? coords.top - 340 : coords.top,
            left: current.position === 'right' ? coords.left + coords.width + 30 : current.position === 'left' ? coords.left - 430 : coords.left
          } : {}}
        >
          {/* Header */}
          <div className="bg-slate-950 p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <Cpu className="h-5 w-5 text-white animate-pulse" />
                   </div>
                   <div className="flex flex-col">
                      <h4 className="text-lg font-[1000] uppercase tracking-tighter italic leading-none">System <span className="text-indigo-400">Intelligence</span></h4>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Onboarding Stream</p>
                   </div>
                </div>
                <button onClick={skipTour} className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                   <X className="h-4 w-4 text-slate-400" />
                </button>
             </div>

             {/* Dynamic Progress Bar */}
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
             </div>
          </div>

          {/* Content */}
          <div className="p-10 space-y-8 bg-white dark:bg-slate-900">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Badge className="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border-none font-black text-[9px] uppercase tracking-widest px-3 h-6 italic">
                     Node {currentStep + 1} of {steps.length}
                   </Badge>
                   <div className="h-px flex-1 bg-slate-50 dark:bg-slate-800" />
                </div>
                <h5 className="text-2xl font-[1000] text-slate-950 dark:text-white uppercase italic tracking-tighter leading-tight">
                  {current.title.replace('Welcome', `Welcome, ${userName}`)}
                </h5>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed italic">
                  {current.content}
                </p>
             </div>

             {/* Footer Controls */}
             <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={prevStep} 
                   disabled={currentStep === 0}
                   className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-0"
                >
                   <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                
                <Button 
                   onClick={nextStep} 
                   className="h-14 px-10 rounded-2xl bg-slate-950 dark:bg-indigo-600 hover:scale-105 active:scale-95 text-white font-black text-[10px] uppercase tracking-[0.3em] gap-4 shadow-2xl transition-all"
                >
                   {currentStep === steps.length - 1 ? 'Execute Start' : 'Next Node'}
                   <ChevronRight className="h-4 w-4" />
                </Button>
             </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Target Highlight Ring */}
      {current.position !== 'center' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute border-2 border-indigo-500 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.4)] z-[9998] transition-all duration-700"
          style={{
            top: coords.top - 15,
            left: coords.left - 15,
            width: coords.width + 30,
            height: coords.height + 30,
          }}
        >
          <div className="absolute inset-0 border-2 border-indigo-500/50 rounded-2xl animate-ping" />
          <div className="absolute -top-3 -left-3 h-10 w-10 flex items-center justify-center">
             <div className="h-3 w-3 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)]" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
