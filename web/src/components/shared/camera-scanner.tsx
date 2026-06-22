"use client";

import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import { toast } from "sonner";

interface CameraScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (result: string) => void;
}

export function CameraScanner({ open, onOpenChange, onScan }: CameraScannerProps) {
  const [error, setError] = useState<string | null>(null);

  // The latest version uses `onScan` which provides an array of result objects
  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue;
      if (code) {
        onScan(code);
        onOpenChange(false);
      }
    }
  };

  const handleError = (err: any) => {
    // Only handle and log critical permission errors
    if (err?.message?.includes("Permission denied") || err?.name === "NotAllowedError") {
      console.error("Scanner Camera Permission Error:", err);
      setError("Camera permission denied. Please allow camera access in your browser settings.");
      toast.error("Camera permission denied.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-slate-100 bg-white/95 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <DialogHeader className="px-2 pt-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 mb-2">
            <Camera className="h-8 w-8 text-indigo-600" />
          </div>
          <DialogTitle className="text-center text-xl font-black text-slate-900 tracking-tight">Scan Product</DialogTitle>
          <DialogDescription className="text-center text-slate-500 font-medium">
            Position the barcode or QR code inside the frame.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 mb-6 mx-6 relative rounded-2xl overflow-hidden bg-slate-900 min-h-[250px] flex items-center justify-center border border-slate-200 shadow-inner">
          {error ? (
            <div className="p-6 text-center">
              <p className="text-red-400 font-bold text-sm mb-2">Camera Error</p>
              <p className="text-slate-300 text-xs">{error}</p>
            </div>
          ) : (
            <div className="w-full h-full absolute inset-0">
               {/* @ts-ignore - The types for @yudiel/react-qr-scanner occasionally change */}
              <Scanner
                onScan={handleScan}
                onError={handleError}
                formats={['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']}
                components={{
                  audio: true, // Beep on scan
                  finder: false // We will use our own custom finder
                }}
              />
            </div>
          )}
          
          {/* Custom Scanning Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="w-48 h-48 relative">
               <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
               <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
               <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
               <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
               <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
