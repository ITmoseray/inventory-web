"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, ArrowLeft, RefreshCw, CheckCircle, 
  Calendar, Zap, AlertTriangle, User, Briefcase, ShoppingCart
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

  async function handleApprove(id: string) {
    try {
      await approveBusiness(id);
      toast.success("Business approved and activated.");
      fetchPending();
    } catch (error) {
      toast.error("Approval failed.");
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
    <div className="p-4 md:p-8 lg:p-12 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-2">
              <Link href="/super-admin" className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-indigo-400 transition-colors mb-4">
                 <ArrowLeft className="h-3 w-3" /> Back to Nexus
              </Link>
              <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter text-white uppercase italic">Pending <span className="text-amber-500">Approvals</span></h1>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">New registrations & expired trials requiring override</p>
           </div>
           
           <Button variant="ghost" size="icon" onClick={fetchPending} className="rounded-xl hover:bg-white/5 text-slate-500 hover:text-indigo-400">
              <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
           </Button>
        </div>

        {/* Approvals Table */}
        <GlassCard className="overflow-hidden border-slate-800/50">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="hover:bg-transparent border-slate-800">
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest pl-10 h-16">Entity Identification</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-16">Reason / Status</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest text-center h-16">Metadata</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-16 text-right pr-10">Control Override</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [1,2,3].map(i => (
                    <TableRow key={i} className="border-slate-900">
                      <TableCell colSpan={4} className="h-24 p-0">
                         <div className="h-full w-full bg-slate-900/20 animate-pulse" />
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
                    <TableRow key={b.id} className="hover:bg-white/5 border-slate-900 group transition-all">
                      <TableCell className="pl-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-black text-xl group-hover:bg-indigo-500/10 group-hover:text-indigo-500 group-hover:border-indigo-500/20 transition-all">
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-white text-lg tracking-tight">{b.name}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{b.type} • {b.currency}</span>
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
                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                            {b.trialEndDate ? `Ended ${format(new Date(b.trialEndDate), "dd MMM yyyy")}` : `Created ${format(new Date(b.createdAt), "dd MMM yyyy")}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-6">
                           <div className="flex flex-col items-center opacity-60">
                              <ShoppingCart className="h-3 w-3 text-slate-400 mb-1" />
                              <span className="text-xs font-black text-white">{b._count.products}</span>
                           </div>
                           <div className="flex flex-col items-center opacity-60">
                              <Briefcase className="h-3 w-3 text-slate-400 mb-1" />
                              <span className="text-xs font-black text-white">{b._count.sales}</span>
                           </div>
                           <div className="flex flex-col items-center opacity-60">
                              <User className="h-3 w-3 text-slate-400 mb-1" />
                              <span className="text-xs font-black text-white">{b._count.users}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="pr-10 text-right">
                        <div className="flex items-center justify-end gap-3">
                           {b.isExpired && (
                              <Button 
                                onClick={() => handleExtend(b.id)}
                                className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[9px] uppercase tracking-widest border border-slate-700 transition-all"
                              >
                                <Calendar className="h-3 w-3 mr-2" /> Extend Trial
                              </Button>
                           )}
                           <Button 
                             onClick={() => handleApprove(b.id)}
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
    </div>
  );
}
