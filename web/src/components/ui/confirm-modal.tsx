"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ConfirmModalVariant = "delete" | "danger" | "warning";

interface ConfirmModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close (cancel or after confirm) */
  onOpenChange: (open: boolean) => void;
  /** Modal heading */
  title: string;
  /** Descriptive body text — supports JSX */
  description: React.ReactNode;
  /**
   * If supplied, user must type this word exactly before the confirm
   * button activates. Defaults to undefined (no typed confirmation needed).
   */
  confirmWord?: string;
  /** Label shown on the confirm button. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Label shown while loading. Defaults to "Processing…". */
  loadingLabel?: string;
  /** Called when the user clicks confirm (and confirmWord matches if required) */
  onConfirm: () => Promise<void> | void;
  /** Visual variant — changes icon and color tone. Defaults to "delete". */
  variant?: ConfirmModalVariant;
  /** Optional extra warning callout text shown in the red box. */
  warningNote?: string;
}

const VARIANT_CONFIG: Record<
  ConfirmModalVariant,
  { icon: React.ElementType; label: string }
> = {
  delete: { icon: Trash2, label: "Irreversible Deletion" },
  danger: { icon: AlertTriangle, label: "Critical Action" },
  warning: { icon: ShieldAlert, label: "Warning" },
};

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmWord,
  confirmLabel = "Confirm",
  loadingLabel = "Processing…",
  onConfirm,
  variant = "delete",
  warningNote,
}: ConfirmModalProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { icon: Icon, label: variantLabel } = VARIANT_CONFIG[variant];
  const needsTypedConfirm = Boolean(confirmWord);
  const isReady = !needsTypedConfirm || input.trim() === confirmWord;

  async function handleConfirm() {
    if (!isReady) return;
    try {
      setLoading(true);
      await onConfirm();
      onOpenChange(false);
      setInput("");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (loading) return;
    if (!next) setInput("");
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-950 border-rose-500/20 rounded-3xl p-6 shadow-2xl shadow-rose-950/20">
        <DialogHeader className="space-y-3">
          {/* Icon badge */}
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-500 mx-auto sm:mx-0">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Warning callout */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-1">
            <p className="text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 uppercase tracking-wide">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {variantLabel}
            </p>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 leading-relaxed">
              {warningNote ?? "This action is permanent and cannot be reversed. Please proceed with caution."}
            </p>
          </div>

          {/* Typed confirmation */}
          {needsTypedConfirm && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                Type{" "}
                <span className="text-rose-600 dark:text-rose-400 font-mono font-black">
                  {confirmWord}
                </span>{" "}
                to confirm
              </label>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && isReady && handleConfirm()}
                placeholder={`Type "${confirmWord}"`}
                disabled={loading}
                autoComplete="off"
                className="h-11 rounded-xl uppercase font-mono tracking-widest text-center text-sm border-slate-300 dark:border-slate-800 font-bold"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="flex-1 h-11 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isReady || loading}
              className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20 disabled:opacity-40 transition-all cursor-pointer"
            >
              {loading ? loadingLabel : confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
