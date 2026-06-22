"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Calendar, ArrowRight, MessageSquare, Users } from "lucide-react";
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
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[1000] w-[calc(100vw-2rem)] md:w-[400px] bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.3)] border border-indigo-100/50 overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2 opacity-40" />
          
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/50 text-slate-400 transition-all hover:rotate-90 z-20"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-7 md:p-10">
            <div className="flex items-center gap-5 md:gap-6 mb-6 md:mb-8">
              <div className="relative h-16 w-16 md:h-20 md:w-20 shrink-0">
                <div className="absolute inset-0 bg-indigo-600 rounded-2xl rotate-6 opacity-10" />
                <div className="relative h-full w-full rounded-2xl overflow-hidden border-2 border-white shadow-xl z-10">
                  <Image 
                    src="/images/1000001630.jpg" 
                    alt="Technical Expert" 
                    fill 
                    className="object-cover"
                  />
                </div>
                {/* Online Indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full z-20 shadow-lg animate-pulse" />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                   <div className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[7px] font-black uppercase tracking-widest">Certified</div>
                   <span className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-600 leading-none">
                     Executive Support
                   </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter uppercase italic">
                  New to <br /> <span className="text-indigo-600 font-light">Protech OS?</span>
                </h3>
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <p className="text-sm md:text-base font-bold text-slate-500 leading-tight">
                Our executive specialists are ready to help you scale your business today.
              </p>
            </div>

            <div className="space-y-3">
              <a 
                href="https://wa.me/23234955581" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-14 md:h-16 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-indigo-600/20 group"
              >
                <Phone className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                Schedule Executive Call
              </a>
              
              <button 
                onClick={() => {
                  window.location.href = "/demo";
                }}
                className="w-full h-14 md:h-16 rounded-2xl border-2 border-slate-100 hover:border-slate-900 bg-white/50 text-slate-900 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all group"
              >
                <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform text-indigo-600" />
                Explore Demo Account
              </button>
            </div>

            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center shadow-sm">
                      <Users className="h-3 w-3 text-indigo-600" />
                    </div>
                  ))}
                </div>
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Expert Team <br /> Online
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-emerald-500">
                <MessageSquare className="h-3 w-3 shrink-0" />
                <span className="text-[8px] font-black uppercase tracking-widest">Live Agent</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
