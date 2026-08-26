"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { 
  Eraser, 
  RotateCcw, 
  Check, 
  PenTool, 
  ShieldCheck, 
  Lock, 
  Calendar, 
  User, 
  Briefcase 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

interface DigitalSignaturePadProps {
  label: string;
  description?: string;
  initialSignature?: string | null;
  signerName?: string;
  signerRole?: string;
  signedAt?: string | Date | null;
  onSaveSignature?: (signatureBase64: string) => Promise<void> | void;
  isLocked?: boolean;
  disabled?: boolean;
}

export function DigitalSignaturePad({
  label,
  description = "Draw your official digital signature using your mouse, touchpad, touchscreen or stylus pen.",
  initialSignature,
  signerName,
  signerRole,
  signedAt,
  onSaveSignature,
  isLocked = false,
  disabled = false
}: DigitalSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokesCount, setStrokesCount] = useState(0);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const [savedSignature, setSavedSignature] = useState<string | null>(initialSignature || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!initialSignature && !isLocked);

  // Initialize and resize canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width || 450);
    const height = 180;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#1e1b4b"; // Dark indigo / ink color

    // If there's an initial signature image to redraw
    if (savedSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = savedSignature;
    }
  }, [savedSignature]);

  useEffect(() => {
    if (isEditing) {
      setupCanvas();
      const handleResize = () => setupCanvas();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isEditing, setupCanvas]);

  useEffect(() => {
    if (initialSignature) {
      setSavedSignature(initialSignature);
      setIsEditing(false);
    }
  }, [initialSignature]);

  // Coordinate extraction
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Start Drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (disabled || isLocked || !isEditing) return;
    if ("button" in e && (e as React.MouseEvent).button !== 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save history state before starting new stroke
    const dpr = window.devicePixelRatio || 1;
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory(prev => [...prev.slice(-10), currentState]);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setStrokesCount(prev => prev + 1);
  };

  // Draw
  const draw = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (!isDrawing || disabled || isLocked || !isEditing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Stop Drawing
  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  // Clear Canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokesCount(0);
    setStrokeHistory([]);
  };

  // Undo last stroke
  const handleUndo = () => {
    if (strokeHistory.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const previousState = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setStrokeHistory(prev => prev.slice(0, -1));
    setStrokesCount(prev => Math.max(0, prev - 1));
  };

  // Save Signature
  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (strokesCount === 0) {
      toast.error("Please draw your signature before saving.");
      return;
    }

    try {
      setIsSaving(true);
      const dataUrl = canvas.toDataURL("image/png");
      
      if (onSaveSignature) {
        await onSaveSignature(dataUrl);
      }

      setSavedSignature(dataUrl);
      setIsEditing(false);
      toast.success("Digital signature saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save signature.");
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = signedAt 
    ? format(new Date(signedAt), "PPP 'at' pp") 
    : format(new Date(), "PPP 'at' pp");

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <PenTool className="h-3.5 w-3.5 text-indigo-500" />
              {label}
            </label>
            {savedSignature && !isEditing && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3" />
                Signed &amp; Verified
              </span>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                <Lock className="h-2.5 w-2.5" />
                Locked
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {description}
          </p>
        </div>

        {savedSignature && !isLocked && !isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(true);
              setStrokesCount(0);
            }}
            className="h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Re-Sign
          </Button>
        )}
      </div>

      {/* Signature Area */}
      {isEditing ? (
        <div className="space-y-2">
          <div 
            ref={containerRef}
            className="relative w-full rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 bg-slate-50/80 dark:bg-slate-950 p-2 overflow-hidden shadow-inner touch-none"
          >
            {/* Signature Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              className="w-full h-[180px] bg-white dark:bg-slate-900 rounded-xl cursor-crosshair shadow-sm select-none"
              style={{ touchAction: "none" }}
            />

            {/* Helper Guideline */}
            <div className="pointer-events-none absolute bottom-8 left-6 right-6 border-b border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between text-[9px] text-slate-400 font-mono select-none">
              <span>✕ Sign on line</span>
              <span>Protech Assist Cryptographic Pad</span>
            </div>

            {/* Live Indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 pointer-events-none">
              <div className={cn(
                "h-2 w-2 rounded-full",
                strokesCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
              )} />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {strokesCount > 0 ? `${strokesCount} strokes recorded` : "Waiting for signature"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={strokesCount === 0 || isSaving}
                className="h-9 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-rose-600 hover:border-rose-300 gap-1.5"
              >
                <Eraser className="h-3.5 w-3.5" />
                Clear
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={strokeHistory.length === 0 || isSaving}
                className="h-9 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-500 gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Undo
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {savedSignature && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="h-9 px-3 rounded-xl text-[10px] font-bold text-slate-500"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={strokesCount === 0 || isSaving}
                className="h-9 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-md shadow-indigo-600/20 gap-1.5"
              >
                {isSaving ? (
                  <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Save Signature
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Read-Only Signature Certificate Card */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80">
            {savedSignature ? (
              <img 
                src={savedSignature} 
                alt="Digital Signature" 
                className="max-h-24 w-auto object-contain select-none filter contrast-125 dark:invert dark:brightness-200" 
              />
            ) : (
              <p className="text-xs text-slate-400 font-mono italic py-4">No signature captured yet.</p>
            )}
          </div>

          {/* Certificate Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
            {signerName && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">
                  Signer: <strong className="text-slate-900 dark:text-white font-bold">{signerName}</strong>
                </span>
              </div>
            )}
            {signerRole && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Briefcase className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">
                  Designation: <strong className="text-slate-900 dark:text-white font-bold">{signerRole}</strong>
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 sm:justify-end">
              <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
