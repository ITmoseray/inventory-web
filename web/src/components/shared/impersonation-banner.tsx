"use client";

import { useState } from "react";
import { stopImpersonation } from "@/lib/actions/super-admin";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImpersonationBannerProps {
  businessName: string;
}

export function ImpersonationBanner({ businessName }: ImpersonationBannerProps) {
  const [loading, setLoading] = useState(false);

  const handleStopImpersonation = async () => {
    setLoading(true);
    try {
      await stopImpersonation();
      toast.success("Returned to Super Admin Hub");
      // Force a hard redirect to reload session state and redirect to super-admin dashboard
      window.location.href = "/super-admin";
    } catch (error: any) {
      console.error("Stop impersonation error:", error);
      toast.error(error.message || "Failed to stop impersonation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-orange-600/15 to-amber-500/10 border-b border-amber-500/30 backdrop-blur-md py-3 px-4 flex items-center justify-between text-slate-900 dark:text-amber-100 sticky top-0 z-50 animate-fade-in shadow-md">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center animate-pulse">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">Impersonation Node Active</span>
          <p className="text-xs font-bold text-slate-650 dark:text-slate-300 mt-0.5">
            You are viewing <span className="font-extrabold text-amber-700 dark:text-amber-300">{businessName}</span> as a Business Administrator.
          </p>
        </div>
      </div>
      <Button
        onClick={handleStopImpersonation}
        disabled={loading}
        size="sm"
        className="h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-amber-600/10 hover:shadow-amber-700/20 flex gap-2"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <LogOut className="h-3.5 w-3.5" />
        )}
        Stop Impersonating
      </Button>
    </div>
  );
}
