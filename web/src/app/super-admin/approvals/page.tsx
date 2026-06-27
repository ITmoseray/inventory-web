"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, ArrowLeft, RefreshCw, CheckCircle, 
  Calendar, Zap, AlertTriangle, User, Briefcase, ShoppingCart, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/super-admin/glass-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  getPendingTrialApprovals, 
  approveBusiness, 
  extendTrial 
} from "@/lib/actions/super-admin";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function PendingApprovals() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval Custom Modal states
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState("BASIC");
  const [expiryPreset, setExpiryPreset] = useState("1month");
  const [customExpiryDate, setCustomExpiryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    try {
      setLoading(true);
      const data = await getPendingTrialApprovals();
      setPending(data);
    } catch (error) {
      toast.error("Failed to fetch pending approvals.");
    } finally {
      setLoading(false);
    }
  }

  function openApprovalModal(business: any) {
    setSelectedBusiness(business);
    setSelectedPlan(business.plan || "BASIC");

    // Auto-select expiry preset based on what the user requested
    const billing = business.requestedBillingPeriod || 'monthly';
    setExpiryPreset(billing === 'annual' ? '1year' : '1month');
    
    // Set default custom date based on billing period
    const defaultExpiry = new Date();
    if (billing === 'annual') {
      defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
    } else {
      defaultExpiry.setMonth(defaultExpiry.getMonth() + 1);
    }
    setCustomExpiryDate(defaultExpiry.toISOString().split("T")[0]);
    
    setApprovalModalOpen(true);
  }

  async function handleConfirmApprove() {
    if (!selectedBusiness) return;
    try {
      setSubmitting(true);
      
      const now = new Date();
      let expiryDate = new Date();

      if (expiryPreset === "7days") {
        expiryDate.setDate(now.getDate() + 7);
      } else if (expiryPreset === "1month") {
        expiryDate.setMonth(now.getMonth() + 1);
      } else if (expiryPreset === "3months") {
        expiryDate.setMonth(now.getMonth() + 3);
      } else if (expiryPreset === "6months") {
        expiryDate.setMonth(now.getMonth() + 6);
      } else if (expiryPreset === "1year") {
        expiryDate.setFullYear(now.getFullYear() + 1);
      } else if (expiryPreset === "custom") {
        if (!customExpiryDate) {
          toast.error("Please pick a custom expiration date.");
          setSubmitting(false);
          return;
        }
        expiryDate = new Date(customExpiryDate);
      }

      await approveBusiness(selectedBusiness.id, expiryDate.toISOString(), selectedPlan);
      toast.success("Business approved and subscription set.");
      setApprovalModalOpen(false);
      fetchPending();
    } catch (error) {
      toast.error("Approval failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExtend(id: string) {
    try {
      await extendTrial(id, 7);
      toast.success("Trial extended by 7 days.");
      fetchPending();
    } catch (error) {
      toast.error("Extension failed.");
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 text-slate-900 dark:text-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-2">
              <Link href="/super-admin" className="flex items-center gap-2 text-indigo-650 dark:text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mb-4">
                 <ArrowLeft className="h-3 w-3" /> Back to Nexus
              </Link>
              <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">Pending <span className="text-amber-500">Approvals</span></h1>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">New registrations & expired trials requiring override</p>
           </div>
           
           <Button variant="ghost" size="icon" onClick={fetchPending} className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
              <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
           </Button>
        </div>

        {/* Approvals Table */}
        <GlassCard className="overflow-hidden border-slate-200/80 dark:border-slate-800/50">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-slate-100/50 dark:bg-slate-900/50">
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest pl-10 h-16">Entity Identification</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-16">Reason / Status</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest text-center h-16">Metadata</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-16 text-right pr-10">Control Override</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [1,2,3].map(i => (
                    <TableRow key={i} className="border-slate-200 dark:border-slate-900">
                      <TableCell colSpan={4} className="h-24 p-0">
                         <div className="h-full w-full bg-slate-200/50 dark:bg-slate-900/20 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : pending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center">
                       <div className="flex flex-col items-center gap-4">
                          <ShieldCheck className="h-12 w-12 text-emerald-500/20" />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">All nodes operational. No pending overrides.</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pending.map((b) => (
                    <TableRow key={b.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 border-slate-200 dark:border-slate-900 group transition-all">
                      <TableCell className="pl-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-xl group-hover:bg-indigo-500/10 group-hover:text-indigo-500 group-hover:border-indigo-500/20 transition-all">
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{b.name}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{b.type} • {b.currency}</span>
                            {(b.email || b.phone) && (
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 mt-1">
                                {b.email} {b.phone ? `| ${b.phone}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          {b.status === 'PENDING' ? (
                            <div className="flex items-center gap-2 text-amber-500">
                               <AlertTriangle className="h-3 w-3" />
                               <span className="text-[10px] font-black uppercase tracking-widest">New Registration</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-rose-500">
                               <Zap className="h-3 w-3" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Trial Expired</span>
                            </div>
                          )}
                          
                          {/* Selected/Requested Plan */}
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 dark:bg-indigo-400/5 text-indigo-650 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider w-fit border border-indigo-500/10">
                              Requested: {b.plan}
                            </div>
                            <div className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider w-fit border",
                              b.requestedBillingPeriod === 'annual'
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                            )}>
                              {b.requestedBillingPeriod === 'annual' ? '⚡ Annual' : 'Monthly'}
                            </div>
                          </div>

                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                            {b.trialEndDate ? `Ended ${format(new Date(b.trialEndDate), "dd MMM yyyy")}` : `Created ${format(new Date(b.createdAt), "dd MMM yyyy")}`}
                          </div>

                          {b.registrationReceipt && (
                            <div className="text-[8px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[200px]" title={b.registrationReceipt}>
                              Ref: {b.registrationReceipt}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-6">
                           <div className="flex flex-col items-center opacity-60">
                              <ShoppingCart className="h-3 w-3 text-slate-400 mb-1" />
                              <span className="text-xs font-black text-slate-900 dark:text-white">{b._count.products}</span>
                           </div>
                           <div className="flex flex-col items-center opacity-60">
                              <Briefcase className="h-3 w-3 text-slate-400 mb-1" />
                              <span className="text-xs font-black text-slate-900 dark:text-white">{b._count.sales}</span>
                           </div>
                           <div className="flex flex-col items-center opacity-60">
                              <User className="h-3 w-3 text-slate-400 mb-1" />
                              <span className="text-xs font-black text-slate-900 dark:text-white">{b._count.users}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="pr-10 text-right">
                        <div className="flex items-center justify-end gap-3">
                           {b.isExpired && (
                              <Button 
                                onClick={() => handleExtend(b.id)}
                                className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-black text-[9px] uppercase tracking-widest border border-slate-200 dark:border-slate-700 transition-all"
                              >
                                <Calendar className="h-3 w-3 mr-2" /> Extend Trial
                              </Button>
                           )}
                           <Button 
                             onClick={() => openApprovalModal(b)}
                             className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all"
                           >
                             <CheckCircle className="h-3 w-3 mr-2" /> Activate Node
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </GlassCard>
      </div>

      {/* Expiry & Plan Approval Modal */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
          
          <DialogHeader className="mb-6">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <Clock className="h-6 w-6 animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-[1000] tracking-tight text-slate-900 dark:text-white uppercase italic leading-tight">
              Approve & Set <span className="text-indigo-650 dark:text-indigo-400">Subscription</span>
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-2 leading-relaxed">
              Configure the license plan and choose when the subscription should expire for <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBusiness?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Summary of Requested Plan & Business Details */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-500/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Requested Plan</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-black uppercase text-[8px] tracking-widest">{selectedBusiness?.plan}</span>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full font-black uppercase text-[8px] tracking-widest",
                    selectedBusiness?.requestedBillingPeriod === 'annual'
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}>
                    {selectedBusiness?.requestedBillingPeriod === 'annual' ? '⚡ Annual Billing' : 'Monthly Billing'}
                  </span>
                </div>
              </div>
              {selectedBusiness?.email && (
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Email</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBusiness.email}</span>
                </div>
              )}
              {selectedBusiness?.phone && (
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Phone</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBusiness.phone}</span>
                </div>
              )}
              {selectedBusiness?.registrationReceipt && (
                <div className="flex flex-col gap-1 pt-1.5 border-t border-indigo-100/30">
                  <span className="font-bold text-slate-500 uppercase text-[8px] tracking-wider">Payment Ref / Registration Info</span>
                  <span className="font-mono text-[9px] text-slate-600 dark:text-slate-400 break-all bg-slate-100/50 dark:bg-black/25 p-2 rounded-lg">{selectedBusiness.registrationReceipt}</span>
                </div>
              )}
              {selectedBusiness?.requestedBillingPeriod === 'annual' && (
                <div className="mt-2 pt-2 border-t border-emerald-500/10 flex items-center gap-2 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <span>⚡</span>
                  <span>Annual plan selected — subscription duration auto-set to 1 Year</span>
                </div>
              )}
            </div>
            {/* Plan Selector */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Subscription Plan</Label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="BASIC">BASIC</option>
                <option value="STANDARD">STANDARD</option>
                <option value="BUSINESS">BUSINESS</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
            </div>

            {/* Expiration Preset Selector */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Subscription Duration</Label>
              <select
                value={expiryPreset}
                onChange={(e) => setExpiryPreset(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="7days">7 Days (Standard Trial)</option>
                <option value="1month">1 Month</option>
                <option value="3months">3 Months</option>
                <option value="6months">6 Months</option>
                <option value="1year">1 Year (Annual)</option>
                <option value="custom">Custom Date</option>
              </select>
            </div>

            {/* Custom Expiry Date Input (conditional) */}
            {expiryPreset === "custom" && (
              <div className="space-y-2 animate-[fadeIn_0.2s_ease-out]">
                <Label htmlFor="customDate" className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pick Expiration Date</Label>
                <Input
                  id="customDate"
                  type="date"
                  value={customExpiryDate}
                  onChange={(e) => setCustomExpiryDate(e.target.value)}
                  className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 font-bold"
                />
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                onClick={handleConfirmApprove}
                disabled={submitting}
                className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {submitting ? "Activating..." : "Approve and Activate"}
              </Button>
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => setApprovalModalOpen(false)}
                className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
