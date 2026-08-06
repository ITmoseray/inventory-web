"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
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

  const getCardStyle = () => {
    if (current.position === 'center') return {};

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    
    if (isMobile) {
       return {
         position: 'fixed',
         bottom: '24px',
         left: '24px',
         width: 'calc(100vw - 48px)',
         top: 'auto',
         transform: 'none',
         margin: 0
       } as any;
    }

    const cardWidth = 400;
    let top = coords.top;
    let left = coords.left;

    if (current.position === 'bottom') {
      top = coords.top + coords.height + 24;
    } else if (current.position === 'top') {
      top = coords.top - 280;
    }
    
    if (current.position === 'right') {
      left = coords.left + coords.width + 24;
    } else if (current.position === 'left') {
      left = coords.left - 424;
    }
    
    // Desktop bounds check
    top = Math.max(16, Math.min(window.innerHeight - 320, top));
    left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, left));

    return { top, left, width: cardWidth };
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden font-sans">
      {/* Dimmed Overlay with Spotlight Hole */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 pointer-events-auto backdrop-blur-sm"
        style={{
          clipPath: current.position === 'center' 
            ? 'none' 
            : `polygon(0% 0%, 0% 100%, ${coords.left - 12}px 100%, ${coords.left - 12}px ${coords.top - 12}px, ${coords.left + coords.width + 12}px ${coords.top - 12}px, ${coords.left + coords.width + 12}px ${coords.top + coords.height + 12}px, ${coords.left - 12}px ${coords.top + coords.height + 12}px, ${coords.left - 12}px 100%, 100% 100%, 100% 0%)`
        }}
      />

      {/* Floating Guide Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className={cn(
            "absolute pointer-events-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden",
            current.position === 'center' ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[400px]" : ""
          )}
          style={getCardStyle()}
        >
          {/* Header */}
          <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 p-5 relative overflow-hidden">
             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm">
                      <Sparkles className="h-4 w-4 text-white" />
                   </div>
                   <div className="flex flex-col">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">System Intelligence</h4>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Onboarding Stream</p>
                   </div>
                </div>
                <button onClick={skipTour} className="h-7 w-7 rounded-full bg-slate-200/50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                   <X className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                </button>
             </div>

             {/* Dynamic Progress Bar */}
             <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-teal-500"
                />
             </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
             <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <Badge className="bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border-none font-semibold text-[10px] uppercase tracking-wider px-2 h-5">
                     Step {currentStep + 1} of {steps.length}
                   </Badge>
                </div>
                <h5 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {current.title.replace('Welcome', `Welcome, ${userName}`)}
                </h5>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {current.content}
                </p>
             </div>

             {/* Footer Controls */}
             <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={prevStep} 
                   disabled={currentStep === 0}
                   className="h-9 px-4 rounded-lg font-medium text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                   <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Back
                </Button>
                
                <Button 
                   size="sm"
                   onClick={nextStep} 
                   className="h-9 px-5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-sm transition-colors"
                >
                   {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                   <ChevronRight className="ml-1 h-3.5 w-3.5" />
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
          className="absolute border-2 border-teal-500 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.4)] z-[9998] transition-all duration-700"
          style={{
            top: coords.top - 15,
            left: coords.left - 15,
            width: coords.width + 30,
            height: coords.height + 30,
          }}
        >
          <div className="absolute inset-0 border-2 border-teal-500/50 rounded-2xl animate-ping" />
          <div className="absolute -top-3 -left-3 h-10 w-10 flex items-center justify-center">
             <div className="h-3 w-3 bg-teal-500 rounded-full shadow-[0_0_15px_rgba(20,184,166,1)]" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
