"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { 
  Zap, AlertTriangle, ShieldAlert, MessageSquare, 
  ArrowRight, LogOut, CreditCard, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/super-admin/glass-card";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function TrialExpiredPage() {
  const { data: session, update } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleSync() {
    try {
      setIsSyncing(true);
      await update();
      // If update was successful and trial is now valid, middleware will redirect them next time they try to access dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Sync failed. Please log out and in again.");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full relative z-10"
      >
        <GlassCard className="p-8 md:p-12 border-rose-500/20 bg-slate-900/40 text-center">
          <div className="flex flex-col items-center gap-6 mb-10">
            <div className="relative h-20 w-20 rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl rotate-3 mb-4">
               <Image src="/images/logo2.jpeg" alt="Protech Logo" fill className="object-cover" />
            </div>
            
            <div className="space-y-2">
               <div className="flex items-center justify-center gap-3 text-rose-500 mb-2">
                  <Clock className="h-6 w-6 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">Session Limit Reached</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-[1000] tracking-tighter text-white uppercase italic leading-none">Trial <span className="text-rose-500">Expired</span></h1>
               <p className="text-slate-500 font-black text-xs uppercase tracking-widest mt-4">Your 7-day operational trial has concluded.</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Your business node "{session?.user?.name || "Target Node"}" has completed its initial evaluation phase. 
              To maintain system integrity and continue operations, a valid license is required.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <Link href="/pricing" className="w-full">
                 <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                    <Zap className="mr-2 h-4 w-4 fill-current" /> Upgrade Now
                 </Button>
              </Link>
              <Button 
                variant="outline"
                className="w-full h-14 rounded-2xl border-slate-800 bg-transparent text-slate-300 hover:bg-white/5 font-black text-xs uppercase tracking-widest transition-all"
                onClick={() => window.open('https://wa.me/232XXXXXXXXX', '_blank')}
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Contact Sales
              </Button>
            </div>

            <div className="pt-8 flex flex-col items-center gap-4">
               <div className="h-px w-full bg-slate-800/50" />
               <div className="flex flex-col sm:flex-row items-center gap-6">
                  <button 
                    disabled={isSyncing}
                    onClick={handleSync}
                    className="flex items-center gap-2 text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-[0.3em] transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} /> {isSyncing ? "Syncing..." : "Sync Node Status"}
                  </button>
                  <button 
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-rose-500 uppercase tracking-[0.3em] transition-colors"
                  >
                      <LogOut className="h-3 w-3" /> Deauthorize Session
                  </button>
               </div>
            </div>
          </div>
        </GlassCard>
        
        <div className="mt-8 flex items-center justify-center gap-2 opacity-50">
           <ShieldAlert className="h-3 w-3 text-slate-600" />
           <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">Nexus Security Protocol 92.4.0</p>
        </div>
      </motion.div>
    </div>
  );
}
