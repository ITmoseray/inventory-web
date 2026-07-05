"use client";
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, MessageCircle, Copy } from "lucide-react";
import { toast } from "sonner";

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

export function ManualPaymentModal({ isOpen, onClose, planName }: ManualPaymentModalProps) {
  const merchantNumber = "073019699";
  const merchantName = "ProTech Assist";
  const supportWhatsapp = "23234955581";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getWhatsappLink = () => {
    const message = `Hello ProTech Team,\n\nI have successfully initiated the Orange Money payment for the *${planName} Plan*.\n\n*My Details:*\n- Account Name: \n- Phone Number: \n- Transaction ID: \n\n[Please find attached my payment receipt screenshot]`;
    return `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(message)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-[460px] max-h-[90vh] overflow-y-auto rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-2xl p-0 bg-white dark:bg-slate-950 text-slate-900 dark:text-white custom-scrollbar select-none">
        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6 sm:p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-10 -translate-y-10" />
          <div className="flex items-center gap-3 sm:gap-4 mb-3 relative z-10">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
              <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight italic leading-tight">Pay with Orange Money</h3>
              <p className="text-orange-100 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mt-0.5">SL Mobile Wallet Settlement</p>
            </div>
          </div>
          <div className="inline-flex px-3 py-1 rounded-full bg-white/20 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-1">
            PLAN Node: {planName}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
          {/* Credentials Card */}
          <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-row items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">Orange Money Number</p>
                <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 select-all">{merchantNumber}</p>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-9 px-2.5 sm:px-3 rounded-xl border border-slate-200/60 dark:border-slate-800 gap-1 sm:gap-1.5 font-bold text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-white dark:hover:bg-slate-800 shrink-0"
                onClick={() => handleCopy(merchantNumber, "Phone Number")}
              >
                <Copy size={11} className="sm:w-3 sm:h-3" /> Copy
              </Button>
            </div>

            <div className="flex flex-row items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">Merchant Account Name</p>
                <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 select-all">{merchantName}</p>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-9 px-2.5 sm:px-3 rounded-xl border border-slate-200/60 dark:border-slate-800 gap-1 sm:gap-1.5 font-bold text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-white dark:hover:bg-slate-800 shrink-0"
                onClick={() => handleCopy(merchantName, "Merchant Name")}
              >
                <Copy size={11} className="sm:w-3 sm:h-3" /> Copy
              </Button>
            </div>
          </div>

          {/* Stepper Steps */}
          <div className="space-y-5">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-orange-500 rounded-full" /> Settlement Pipeline:
            </h4>
            
            <div className="space-y-4 pl-1 relative border-l border-slate-100 dark:border-slate-800 ml-2 sm:ml-3">
              {/* Step 1 */}
              <div className="relative pl-5 sm:pl-6">
                <div className="absolute -left-[11px] sm:-left-[13px] top-0 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center border border-orange-500 text-[9px] sm:text-[10px] font-black text-orange-600">
                  1
                </div>
                <h5 className="text-[9px] sm:text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Execute Wallet Transfer</h5>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  Send the payment amount matching your subscription rate to the number above.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative pl-5 sm:pl-6">
                <div className="absolute -left-[11px] sm:-left-[13px] top-0 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-300 dark:border-slate-700 text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400">
                  2
                </div>
                <h5 className="text-[9px] sm:text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Capture Confirmation</h5>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  Take a clear screenshot of your transaction success receipt or copy the confirmation SMS.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative pl-5 sm:pl-6">
                <div className="absolute -left-[11px] sm:-left-[13px] top-0 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-300 dark:border-slate-700 text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400">
                  3
                </div>
                <h5 className="text-[9px] sm:text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Verify via WhatsApp</h5>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  Click the WhatsApp verification button below. Send the pre-formatted receipt message to our billing node.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex flex-col sm:flex-row gap-3 pt-5 sm:pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button 
              variant="ghost" 
              className="w-full sm:flex-1 h-11 sm:h-12 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 order-2 sm:order-1" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className="w-full sm:flex-1 h-11 sm:h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-orange-600/20 order-1 sm:order-2"
              onClick={() => window.open(getWhatsappLink(), '_blank')}
            >
              <MessageCircle className="h-4 w-4" /> Dispatch Verify
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
