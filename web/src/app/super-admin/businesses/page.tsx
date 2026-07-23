"use client";

import { useState, useEffect } from "react";
import { 
  Globe, Search, MoreVertical, KeyRound, UserCheck, 
  CheckCircle, Trash2, ArrowLeft, Filter, Zap, Shield, Copy,
  Megaphone, PieChart, TrendingUp, Eye, FileText, Sparkles,
  Building2, Mail, Phone, MapPin, Coins, Clock, Compass, Users
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { motion, AnimatePresence } from "framer-motion";

export default function TenantVault() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [showFormModal, setShowFormModal] = useState(false);

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

  // Calculate Referral / Acquisition Analytics
  const channelCounts: Record<string, number> = {};
  businesses.forEach((b) => {
    const source = b.referralSource || "Unspecified / Direct";
    channelCounts[source] = (channelCounts[source] || 0) + 1;
  });

  const channelList = Object.entries(channelCounts).sort((a, b) => b[1] - a[1]);

  const filtered = businesses.filter((b) => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.email && b.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.referralSource && b.referralSource.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.customReferralSource && b.customReferralSource.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesChannel = 
      selectedChannel === "ALL" ||
      (b.referralSource || "Unspecified / Direct") === selectedChannel;

    return matchesSearch && matchesChannel;
  });

  return (
    <div className="p-4 md:p-8 lg:p-12 text-slate-900 dark:text-slate-200">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-2">
              <Link href="/super-admin" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-indigo-500 transition-colors mb-4">
                 <ArrowLeft className="h-3 w-3" /> Back to Control Panel
              </Link>
              <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">
                Client <span className="text-indigo-500">Registry Vault</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">
                Registered account submissions & Marketing acquisition window
              </p>
           </div>

           <div className="flex items-center gap-3">
              <GlassCard className="p-3 px-5 flex items-center gap-3 bg-slate-100/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
                 <Users className="h-4 w-4 text-indigo-500" />
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Total Accounts</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{businesses.length}</p>
                 </div>
              </GlassCard>
           </div>
        </div>

        {/* SPECIAL WINDOW: How Did You Hear About Us Insights & Channel Analytics */}
        <GlassCard className="p-6 md:p-8 bg-gradient-to-br from-indigo-900/10 via-slate-900/40 to-slate-950 border-indigo-500/20 space-y-6">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Megaphone className="h-5 w-5 animate-pulse" />
                 </div>
                 <div>
                    <h3 className="text-lg font-[1000] uppercase tracking-tight text-white italic">How Clients Discover ProTech OS</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client acquisition channel statistics</p>
                 </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                 <TrendingUp className="h-3.5 w-3.5" />
                 Marketing Intelligence
              </div>
           </div>

           {/* Channel Distribution Pills & Percentage Bars */}
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <button
                type="button"
                onClick={() => setSelectedChannel("ALL")}
                className={cn(
                  "p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between",
                  selectedChannel === "ALL"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30"
                    : "bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700"
                )}
              >
                 <span className="text-[9px] font-black uppercase tracking-widest opacity-80">All Accounts</span>
                 <p className="text-xl font-black mt-2 leading-none">{businesses.length}</p>
                 <span className="text-[8px] font-bold mt-1 opacity-70">100% of registrations</span>
              </button>

              {channelList.map(([channel, count]) => {
                const percentage = businesses.length > 0 ? Math.round((count / businesses.length) * 100) : 0;
                const isSelected = selectedChannel === channel;
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => setSelectedChannel(channel)}
                    className={cn(
                      "p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group",
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30"
                        : "bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700"
                    )}
                  >
                     <span className="text-[9px] font-black uppercase tracking-wider line-clamp-1 opacity-80">{channel}</span>
                     <p className="text-xl font-black mt-2 leading-none">{count} <span className="text-xs font-normal opacity-70">({percentage}%)</span></p>
                     <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
                        <div className={cn("h-full", isSelected ? "bg-white" : "bg-indigo-500")} style={{ width: `${percentage}%` }} />
                     </div>
                  </button>
                );
              })}
           </div>
        </GlassCard>

        {/* Search & Channel Filter Status Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
           <div className="w-full sm:w-96 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input 
                placeholder="Search by company, email, or referral source..." 
                className="pl-12 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 text-xs shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>

           {selectedChannel !== "ALL" && (
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl">
                 <span className="text-xs font-bold text-indigo-400">Filter: {selectedChannel}</span>
                 <button 
                   onClick={() => setSelectedChannel("ALL")}
                   className="text-[10px] font-black text-rose-400 hover:underline uppercase tracking-wider ml-2"
                 >
                   Clear Filter
                 </button>
              </div>
           )}
        </div>

        {/* Registered Accounts Table */}
        <GlassCard className="overflow-hidden border-slate-200/80 dark:border-slate-800/50 shadow-xl">
          <div className="overflow-x-auto">
            <Table className="min-w-[950px]">
              <TableHeader className="bg-slate-100/60 dark:bg-slate-900/60">
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest pl-8 h-16">Organization Account</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-16">How Heard About Us</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-16">Plan & Region</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-16">Registered On</TableHead>
                  <TableHead className="w-[140px] pr-8 h-16 text-right">Account Form</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [1,2,3,4,5].map(i => (
                    <TableRow key={i} className="border-slate-200 dark:border-slate-900">
                      <TableCell colSpan={5} className="h-20 p-0">
                         <div className="h-full w-full bg-slate-200/50 dark:bg-slate-900/20 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                       <div className="flex flex-col items-center gap-3">
                          <Globe className="h-10 w-10 text-slate-400 animate-pulse" />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">No matching registered accounts found.</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((b) => (
                    <TableRow key={b.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 border-slate-200 dark:border-slate-900 group transition-all">
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                             <span 
                               onClick={() => {
                                 setSelectedStore(b);
                                 setShowFormModal(true);
                               }}
                               className="font-black text-slate-900 dark:text-white text-base tracking-tight group-hover:text-indigo-500 transition-colors cursor-pointer hover:underline"
                             >
                                {b.name}
                             </span>
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{b.email || b.slug}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-wider w-fit">
                               <Megaphone className="h-3 w-3" />
                               {b.referralSource || "Direct / Unspecified"}
                            </span>
                            {b.customReferralSource && (
                               <span className="text-[9.5px] font-medium text-slate-400 italic line-clamp-1">
                                 "{b.customReferralSource}"
                               </span>
                            )}
                         </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col gap-1">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase w-fit tracking-widest",
                              b.plan === 'ENTERPRISE' ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            )}>
                              {b.plan}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{b.currency} • {b.type}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                           {format(new Date(b.createdAt), "dd MMM yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                         <Button
                           size="sm"
                           onClick={() => {
                             setSelectedStore(b);
                             setShowFormModal(true);
                           }}
                           className="h-9 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest gap-1.5 transition-all shadow-md"
                         >
                            <FileText className="h-3.5 w-3.5" />
                            View Form
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </GlassCard>

      </div>

      {/* SPECIAL WINDOW: CLIENT REGISTRATION ACCOUNT FORM VIEW MODAL */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="w-[94vw] sm:max-w-2xl rounded-[2.5rem] p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto custom-scrollbar">
          <DialogHeader className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-600/30 shrink-0">
                     {selectedStore?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                     <DialogTitle className="text-xl sm:text-2xl font-[1000] tracking-tight uppercase italic leading-tight text-slate-900 dark:text-white">
                        {selectedStore?.name}
                     </DialogTitle>
                     <DialogDescription className="text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mt-1">
                        Client Registration Form Submission Record
                     </DialogDescription>
                  </div>
               </div>
               <span className={cn(
                  "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0",
                  selectedStore?.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
               )}>
                  {selectedStore?.status}
               </span>
            </div>
          </DialogHeader>

          {selectedStore && (
            <div className="space-y-6">

               {/* FORM SECTION 1: HOW DID YOU HEAR ABOUT US DISCOVERY CHANNEL */}
               <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                     <Megaphone className="h-4 w-4" />
                     <h4 className="text-[10px] font-black uppercase tracking-[0.25em]">How Client Discovered ProTech OS</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Selected Discovery Channel</span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-300 block mt-0.5">
                           {selectedStore.referralSource || "Unspecified / Direct"}
                        </span>
                     </div>
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Custom Typed Details</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5 italic">
                           {selectedStore.customReferralSource ? `"${selectedStore.customReferralSource}"` : "None provided"}
                        </span>
                     </div>
                  </div>
               </div>

               {/* FORM SECTION 2: ORGANIZATION PROFILE */}
               <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Building2 className="h-4 w-4 text-indigo-500" /> Organization Profile Form Data
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Company / School Name</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{selectedStore.name}</span>
                     </div>
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Industry Type</span>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block uppercase">
                           {selectedStore.type} {selectedStore.institutionType ? `(${selectedStore.institutionType})` : ""}
                        </span>
                     </div>
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Base Currency</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{selectedStore.currency}</span>
                     </div>
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Timezone</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{selectedStore.timezone}</span>
                     </div>
                     <div className="col-span-2">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Physical Address</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedStore.address || "No physical address provided"}</span>
                     </div>
                  </div>
               </div>

               {/* FORM SECTION 3: OWNER CREDENTIALS & ACCESS */}
               <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Mail className="h-4 w-4 text-indigo-500" /> Account Owner Credentials
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Owner Contact Email</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block select-all">{selectedStore.email || "No email"}</span>
                     </div>
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Contact Phone Number</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{selectedStore.phone || "No phone"}</span>
                     </div>
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Registered On</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">{format(new Date(selectedStore.createdAt), "dd MMM yyyy, HH:mm")}</span>
                     </div>
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Selected Plan</span>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block uppercase">{selectedStore.plan} Plan</span>
                     </div>
                  </div>
               </div>

               {/* SUPER ADMIN QUICK ACTIONS */}
               <div className="pt-4 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                     <Button 
                        onClick={() => handleImpersonate(selectedStore.id)}
                        className="h-12 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg"
                     >
                        <UserCheck className="h-4 w-4" /> Enter Store Dashboard
                     </Button>
                     <Button 
                        variant="outline"
                        onClick={() => handleResetPassword(selectedStore.id)}
                        className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 gap-2"
                     >
                        <KeyRound className="h-4 w-4" /> Reset Password
                     </Button>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                     <Button 
                       variant="ghost" 
                       className="text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest"
                       onClick={() => handleDelete(selectedStore.id, selectedStore.name)}
                     >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                     </Button>
                     <Button 
                       onClick={() => setShowFormModal(false)}
                       className="h-11 px-6 rounded-xl bg-slate-900 text-white dark:bg-slate-800 font-black text-[10px] uppercase tracking-widest"
                     >
                        Close Form Window
                     </Button>
                  </div>
               </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
