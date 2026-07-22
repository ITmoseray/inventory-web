"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { closeSession } from "@/lib/actions/cash-register";
import { useRouter } from "next/navigation";

export function CloseRegisterModal({
  isOpen,
  onClose,
  sessionId
}: {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
}) {
  const [actualEndingCash, setActualEndingCash] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

  if (!sessionId) return null;

  const handleClose = async () => {
    setIsClosing(true);
    try {
      const parsedAmount = parseFloat(actualEndingCash);
      if (isNaN(parsedAmount)) {
         throw new Error("Invalid amount");
      }
      await closeSession(sessionId, parsedAmount);
      toast.success("Shift closed successfully");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Failed to close shift");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem] border-none shadow-2xl p-6 bg-white dark:bg-slate-900 flex flex-col gap-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mb-4">
            <Banknote size={32} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Close Register</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">End current shift</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-500">Actual Ending Cash</Label>
            <Input 
              type="number"
              min="0"
              placeholder="Count money in till"
              value={actualEndingCash}
              onChange={(e) => setActualEndingCash(e.target.value)}
              className="h-14 bg-slate-50 dark:bg-slate-950 font-mono text-lg rounded-xl"
            />
          </div>
        </div>

        <Button 
          disabled={!actualEndingCash || isClosing}
          onClick={handleClose}
          className="w-full h-14 rounded-2xl text-[10px] font-black tracking-widest uppercase bg-rose-600 text-white hover:bg-rose-700 shadow-xl"
        >
          {isClosing ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Close Shift"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
