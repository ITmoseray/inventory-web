"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Sparkles, 
  Rocket, 
  Building2, 
  Box, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { upgradeStoreToEnterpriseAction } from "@/lib/actions/store-builder";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
}

export function StoreUpgradeModal({ isOpen, onClose, storeName }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState(storeName || "");
  const [businessType, setBusinessType] = useState("SHOP");
  const [address, setAddress] = useState("Freetown, Sierra Leone");
  const [phone, setPhone] = useState("");

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error("Please enter your organization name");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await upgradeStoreToEnterpriseAction({
        businessName: businessName.trim(),
        businessType,
        address: address.trim(),
        phone: phone.trim()
      });

      if (res.success) {
        toast.success("Congratulations! Your store is now connected to ProTech Enterprise OS!");
        onClose();
        router.refresh();
      } else {
        toast.error("Upgrade failed. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upgrade store");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card border-border shadow-2xl p-0 overflow-hidden rounded-3xl">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/25 text-white">
                Enterprise OS Upgrade
              </span>
              <DialogTitle className="text-xl font-black tracking-tight text-white mt-0.5">
                Scale Beyond an Online Store
              </DialogTitle>
            </div>
          </div>
          
          <DialogDescription className="text-xs text-indigo-100 leading-relaxed max-w-xl">
            Upgrade your standalone store to full ProTech Enterprise OS. Unify your physical shop, 
            fast POS cashiering, and inventory management with your online storefront.
          </DialogDescription>
        </div>

        <form onSubmit={handleUpgrade} className="p-6 space-y-6">
          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Box, title: "Full Inventory Tracking", desc: "Multi-branch stock, transfers, batch & expiry control." },
              { icon: ShoppingCart, title: "High-Speed POS", desc: "Physical checkout, barcode scanner & thermal receipts." },
              { icon: TrendingUp, title: "P&L & Accounting", desc: "Automated income statements, expenses & tax records." },
              { icon: Users, title: "Staff & Attendance", desc: "Cashier shifts, employee roles & audit activity logs." },
            ].map((f, i) => (
              <div key={i} className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{f.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Business Details Fields */}
          <div className="space-y-3 pt-1 border-t border-border/60">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              Organization Profile
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Business / Organization Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Retail Group"
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Business Category</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="SHOP">Retail Shop / Store</option>
                  <option value="SUPERMARKET">Supermarket / Grocery</option>
                  <option value="PHARMACY">Pharmacy / Health</option>
                  <option value="RESTAURANT">Restaurant / Cafe</option>
                  <option value="BAR">Bar / Lounge</option>
                  <option value="CLINIC">Medical Clinic</option>
                  <option value="HOSPITAL">Hospital</option>
                  <option value="OFFICE">Corporate Office</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">City / Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14 Siaka Stevens Street, Freetown"
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +232 77 123456"
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Non-destructive guarantee */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-[11px] font-medium leading-snug">
              <strong className="font-bold">Zero Data Loss Guarantee:</strong> All your current online store sections, themes, custom branding, and existing customer orders are completely preserved and linked into Enterprise OS.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Keep Standalone
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Upgrading Store...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Confirm &amp; Upgrade to Enterprise OS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
