"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Banknote, RefreshCw, Calculator, Lock, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
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
  const [showDenominations, setShowDenominations] = useState(false);
  const [denominations, setDenominations] = useState<{ [key: string]: number }>({
    "100": 0,
    "50": 0,
    "20": 0,
    "10": 0,
    "5": 0,
    "2": 0,
    "1": 0,
  });
  const [remarks, setRemarks] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

  if (!sessionId) return null;

  const handleDenomChange = (valStr: string, noteValue: number) => {
    const count = parseInt(valStr) || 0;
    const updated = { ...denominations, [noteValue.toString()]: count };
    setDenominations(updated);

    const calculatedTotal = Object.entries(updated).reduce((sum, [denom, qty]) => {
      return sum + (parseFloat(denom) * qty);
    }, 0);

    setActualEndingCash(calculatedTotal > 0 ? calculatedTotal.toString() : "");
  };

  const handleClose = async () => {
    setIsClosing(true);
    try {
      const parsedAmount = parseFloat(actualEndingCash);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        throw new Error("Please enter a valid ending cash amount");
      }
      await closeSession(sessionId, parsedAmount);
      toast.success("Shift closed and reconciled successfully");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Failed to close shift");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] w-[95vw] rounded-[2rem] border-none shadow-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 flex flex-col gap-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="text-center space-y-1.5">
          <div className="mx-auto h-14 w-14 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
            <Banknote size={28} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Close Register Shift
          </h3>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            End of shift physical drawer reconciliation
          </p>
        </div>

        {/* Blind Close Protocol Badge */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
          <Lock className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <div>
            <span className="font-bold block text-[11px] uppercase tracking-wider">Blind Close Protocol Active</span>
            <span className="text-[10px] text-amber-700/80 dark:text-amber-400 font-medium leading-relaxed">
              Expected sales totals remain masked to enforce strict financial audit integrity. Enter actual physical count in till.
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Physical Ending Cash in Drawer
              </Label>
              <button
                type="button"
                onClick={() => setShowDenominations(!showDenominations)}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Calculator className="h-3 w-3" />
                {showDenominations ? "Hide Notes Breakdown" : "Count by Notes (Leones)"}
                {showDenominations ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 font-mono">
                Le
              </span>
              <Input 
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={actualEndingCash}
                onChange={(e) => setActualEndingCash(e.target.value)}
                className="h-13 pl-11 pr-4 bg-slate-50 dark:bg-slate-950 font-mono text-xl font-bold rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Denominations Helper Grid */}
          {showDenominations && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Cash Denominations Tally (Count × Note Value):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Le 100", value: 100 },
                  { label: "Le 50", value: 50 },
                  { label: "Le 20", value: 20 },
                  { label: "Le 10", value: 10 },
                  { label: "Le 5", value: 5 },
                  { label: "Le 2", value: 2 },
                  { label: "Le 1", value: 1 },
                ].map((note) => (
                  <div key={note.value} className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                      {note.label}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={denominations[note.value.toString()] || ""}
                      onChange={(e) => handleDenomChange(e.target.value, note.value)}
                      className="h-9 px-2 text-xs font-mono text-center rounded-xl bg-white dark:bg-slate-900"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shift Handover Remarks */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Shift Handover Remarks (Optional)
            </Label>
            <Textarea
              rows={2}
              placeholder="e.g. Discrepancy explanation, petty cash payout vouchers, or handover notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <Button 
            disabled={!actualEndingCash || isClosing}
            onClick={handleClose}
            className="w-full h-13 rounded-2xl text-xs font-black tracking-wider uppercase bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isClosing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Reconciling Shift...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Finalize &amp; Close Register
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full h-9 rounded-xl text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold"
          >
            Cancel &amp; Return to POS
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
