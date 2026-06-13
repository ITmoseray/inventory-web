"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Calendar, ArrowRight, MessageSquare } from "lucide-react";
import Image from "next/image";

export function ExpertPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after 20 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[1000] w-[calc(100vw-2rem)] md:w-[400px] bg-white rounded-[2.5rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2 opacity-50" />
          
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-all hover:rotate-90 z-20"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8 md:p-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative h-20 w-20 md:h-24 md:w-24 shrink-0">
                <div className="absolute inset-0 bg-indigo-600 rounded-[2rem] rotate-6 opacity-10" />
                <div className="relative h-full w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl z-10">
                  <Image 
                    src="/images/1000001630.jpg" 
                    alt="Technical Expert" 
                    fill 
                    className="object-cover"
                  />
                </div>
                {/* Online Indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full z-20 shadow-lg animate-pulse" />
              </div>
              
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-2 leading-none">
                  Expert Consultation
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-[0.95] tracking-tighter uppercase italic">
                  New to <br /> <span className="text-indigo-600 font-light">Protech?</span>
                </h3>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-base md:text-lg font-bold text-slate-500 leading-tight">
                Our specialists are ready to help you scale your business today.
              </p>
            </div>

            <div className="space-y-3">
              <a 
                href="https://wa.me/23234955581" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-xl shadow-slate-900/20 group"
              >
                <Phone className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                Schedule a call
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform opacity-50" />
              </a>
              
              <button 
                onClick={() => {
                  window.location.href = "/demo";
                }}
                className="w-full h-16 rounded-2xl border-2 border-slate-100 hover:border-slate-900 bg-white text-slate-900 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all group"
              >
                <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform text-indigo-600" />
                Explore demo account
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center shadow-sm">
                      <Users className="h-3 w-3 text-indigo-600" />
                    </div>
                  ))}
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  +12 Experts Online
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-emerald-500">
                <MessageSquare className="h-3 w-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Live Now</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
