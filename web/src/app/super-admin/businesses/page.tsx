"use client";

import { useState, useEffect } from "react";
import { 
  Globe, Search, MoreVertical, KeyRound, UserCheck, 
  CheckCircle, Trash2, ArrowLeft, Filter, Zap, Shield
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  getAllBusinesses, 
  updateBusinessPlan, 
  resetTenantAdminPassword, 
  startImpersonation, 
  approveBusiness, 
  deleteBusiness 
} from "@/lib/actions/super-admin";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TenantVault() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBusinesses();
  }, []);

  async function fetchBusinesses() {
    try {
      setLoading(true);
      const data = await getAllBusinesses();
      setBusinesses(data);
    } catch (error) {
      toast.error("Failed to sync with ecosystem registry.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePlanChange(businessId: string, plan: string) {
    try {
      await updateBusinessPlan(businessId, plan);
      toast.success(`Node license upgraded to ${plan}`);
      fetchBusinesses();
    } catch (error) {
      toast.error("License upgrade failed.");
    }
  }

  async function handleApprove(businessId: string) {
    try {
      await approveBusiness(businessId);
      toast.success("Store activated successfully.");
      fetchBusinesses();
    } catch (error) {
      toast.error("Activation failed.");
    }
  }

  async function handleDelete(businessId: string, name: string) {
    if (window.confirm(`CRITICAL: Delete all data for "${name}"? This action is irreversible.`)) {
      try {
        await deleteBusiness(businessId);
        toast.success(`Store "${name}" has been deleted.`);
        fetchBusinesses();
      } catch (error: any) {
        toast.error(error.message || "Deletion failed.");
      }
    }
  }

  async function handleResetPassword(businessId: string) {
    try {
      const { email, newPassword } = await resetTenantAdminPassword(businessId);
      toast.success(`Password reset for ${email}. New Password: ${newPassword}`, { duration: 10000 });
    } catch (error) {
      toast.error("Password reset failed.");
    }
  }

  async function handleImpersonate(businessId: string) {
    try {
      const admin = await startImpersonation(businessId);
      toast.success(`Entering ${admin.email}'s dashboard...`);
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Dashboard access failed.");
    }
  }

  const filtered = businesses.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 lg:p-12 text-slate-900 dark:text-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-2">
              <Link href="/super-admin" className="flex items-center gap-2 text-indigo-650 dark:text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mb-4">
                 <ArrowLeft className="h-3 w-3" /> Back to Control Panel
              </Link>
              <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">Store <span className="text-indigo-500">Registry</span></h1>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Registered stores & subscription management</p>
           </div>
           
           <div className="flex gap-4">
              <GlassCard className="p-1 px-4 flex items-center gap-3 bg-slate-100/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800">
                 <Filter className="h-4 w-4 text-slate-500" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters Active: 0</span>
              </GlassCard>
           </div>
        </div>

        {/* Search Bar */}
        <GlassCard className="p-4 bg-white dark:bg-slate-900/40">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-650 group-focus-within:text-indigo-500 transition-colors" />
            <Input 
              placeholder="Search by intelligence node name or slug..." 
              className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </GlassCard>

        {/* Tenants Table */}
        <GlassCard className="overflow-hidden border-slate-200/80 dark:border-slate-800/50">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-slate-100/50 dark:bg-slate-900/50">
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest pl-10 h-16">Node Identification</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-16">Intelligence Level</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest text-center h-16">Matrix Stats</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-16">Timestamp</TableHead>
                  <TableHead className="w-[80px] pr-10 h-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [1,2,3,4,5].map(i => (
                    <TableRow key={i} className="border-slate-200 dark:border-slate-900">
                      <TableCell colSpan={5} className="h-24 p-0">
                         <div className="h-full w-full bg-slate-200/50 dark:bg-slate-900/20 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                       <div className="flex flex-col items-center gap-4">
                          <Globe className="h-12 w-12 text-slate-800 dark:text-white animate-pulse" />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">No operational nodes detected in this sector.</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((b) => (
                    <TableRow key={b.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 border-slate-200 dark:border-slate-900 group transition-all">
                      <TableCell className="pl-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-black text-xl shadow-lg shadow-indigo-500/5 group-hover:scale-110 transition-transform">
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">{b.name}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SLUG: {b.slug}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <div className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase w-fit tracking-widest shadow-lg",
                            b.plan === 'ENTERPRISE' ? "bg-indigo-600 text-white shadow-indigo-600/20" : 
                            b.plan === 'BUSINESS' ? "bg-purple-600 text-white shadow-purple-600/20" :
                            b.plan === 'STANDARD' ? "bg-blue-600 text-white shadow-blue-600/20" : 
                            b.plan === 'BASIC' ? "bg-slate-500 text-white shadow-slate-500/20" :
                            "bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400"
                          )}>
                            {b.plan === 'ENTERPRISE' && <Zap className="h-3 w-3 mr-1.5 fill-current" />}
                            {b.plan === 'BUSINESS' && <Shield className="h-3 w-3 mr-1.5 fill-current" />}
                            {b.plan}
                          </div>
                          <div className="flex items-center gap-2">
                             <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", b.status === 'ACTIVE' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-amber-500 shadow-[0_0_8px_#f59e0b]")} />
                             <span className={cn(
                               "text-[10px] font-black uppercase tracking-widest italic",
                               b.status === 'ACTIVE' ? "text-emerald-500" : "text-amber-500"
                             )}>{b.status}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-6">
                           <div className="flex flex-col items-center">
                              <span className="text-sm font-black text-slate-900 dark:text-white">{b._count.products}</span>
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SKUs</span>
                           </div>
                           <div className="flex flex-col items-center">
                              <span className="text-sm font-black text-slate-900 dark:text-white">{b._count.sales}</span>
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Trans</span>
                           </div>
                           <div className="flex flex-col items-center">
                              <span className="text-sm font-black text-slate-900 dark:text-white">{b._count.users}</span>
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Staff</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           {format(new Date(b.createdAt), "dd MMM yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="pr-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
                              <MoreVertical className="h-5 w-5 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 p-2 shadow-2xl backdrop-blur-xl">
                            {b.status === 'PENDING' && (
                               <DropdownMenuItem onClick={() => handleApprove(b.id)} className="rounded-xl p-3 font-black text-emerald-600 dark:text-emerald-500 focus:bg-emerald-50 dark:focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-500 transition-colors uppercase text-[10px] tracking-widest cursor-pointer">
                                 <CheckCircle className="h-4 w-4 mr-3" /> Activate Store
                               </DropdownMenuItem>
                            )}
                            <div className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Plan Management</div>
                            <DropdownMenuItem onClick={() => handlePlanChange(b.id, "FREE")} className="rounded-xl p-3 font-bold text-slate-600 dark:text-slate-400 focus:bg-slate-100 dark:focus:bg-white/5 transition-colors uppercase text-[10px] tracking-widest cursor-pointer">Downgrade: FREE</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePlanChange(b.id, "BASIC")} className="rounded-xl p-3 font-bold text-slate-600 dark:text-slate-400 focus:bg-slate-100 dark:focus:bg-white/5 transition-colors uppercase text-[10px] tracking-widest cursor-pointer">Switch: BASIC</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePlanChange(b.id, "STANDARD")} className="rounded-xl p-3 font-bold text-slate-600 dark:text-slate-400 focus:bg-slate-100 dark:focus:bg-white/5 transition-colors uppercase text-[10px] tracking-widest cursor-pointer">Switch: STANDARD</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePlanChange(b.id, "BUSINESS")} className="rounded-xl p-3 font-bold text-purple-650 dark:text-purple-400 focus:bg-purple-50 dark:focus:bg-purple-500/10 focus:text-purple-650 dark:focus:text-purple-450 transition-colors uppercase text-[10px] tracking-widest cursor-pointer">Switch: BUSINESS</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePlanChange(b.id, "ENTERPRISE")} className="rounded-xl p-3 font-black text-indigo-600 dark:text-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-500/10 focus:text-indigo-650 dark:focus:text-indigo-400 transition-colors uppercase text-[10px] tracking-widest cursor-pointer">Upgrade: ENTERPRISE</DropdownMenuItem>
                            
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                            <div className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Store Settings</div>
                            
                            <DropdownMenuItem onClick={() => handleResetPassword(b.id)} className="rounded-xl p-3 font-black text-rose-600 dark:text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-500/10 focus:text-rose-650 dark:focus:text-rose-500 transition-colors uppercase text-[10px] tracking-widest cursor-pointer">
                              <KeyRound className="h-4 w-4 mr-3" /> Reset Store Password
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleImpersonate(b.id)} className="rounded-xl p-3 font-black text-amber-600 dark:text-amber-500 focus:bg-amber-50 dark:focus:bg-amber-500/10 focus:text-amber-650 dark:focus:text-amber-550 transition-colors uppercase text-[10px] tracking-widest cursor-pointer">
                              <UserCheck className="h-4 w-4 mr-3" /> Enter Store Dashboard
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(b.id, b.name)} className="rounded-xl p-3 font-black text-rose-600 dark:text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-950/20 focus:text-rose-600 dark:focus:text-rose-450 transition-colors uppercase text-[10px] tracking-widest cursor-pointer">
                              <Trash2 className="h-4 w-4 mr-3" /> Delete Store
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
