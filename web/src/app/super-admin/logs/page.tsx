"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Search, ArrowLeft, Terminal, Activity, Filter, Database, Users } from "lucide-react";
import { GlassCard } from "@/components/super-admin/glass-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getAuditLogs } from "@/lib/actions/super-admin";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AuditNexus() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
    } catch (error) {
      toast.error("Failed to sync with security node.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.business?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 lg:p-12 text-slate-900 dark:text-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-2">
              <Link href="/super-admin" className="flex items-center gap-2 text-rose-600 dark:text-rose-500 font-black text-[10px] uppercase tracking-[0.3em] hover:text-rose-500 transition-colors mb-4">
                 <ArrowLeft className="h-3 w-3" /> Back to Nexus
              </Link>
              <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">Audit <span className="text-rose-500">Nexus</span></h1>
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Global ecosystem activity & security telemetry</p>
           </div>
           
           <div className="flex gap-4">
              <GlassCard className="p-4 px-6 flex items-center gap-3 bg-rose-500/5 border-rose-500/20">
                 <Activity className="h-4 w-4 text-rose-500 animate-pulse" />
                 <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Live Security Feed</span>
              </GlassCard>
           </div>
        </div>

        {/* Search & Stats */}
        <div className="grid lg:grid-cols-4 gap-8">
           <GlassCard className="lg:col-span-3 p-4 bg-white dark:bg-slate-900/40">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                <Input 
                  placeholder="Filter by action, entity, business, or operator..." 
                  className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:ring-4 focus:ring-rose-500/10 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
           </GlassCard>
           
           <GlassCard className="p-4 flex items-center justify-center bg-slate-50 dark:bg-slate-950/50">
              <div className="text-center">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total Events</p>
                 <p className="text-2xl font-[1000] text-slate-900 dark:text-white">{filtered.length}</p>
              </div>
           </GlassCard>
        </div>

        {/* Logs Table */}
        <GlassCard className="overflow-hidden border-slate-200/80 dark:border-slate-800/50">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader className="bg-slate-100/50 dark:bg-slate-900/50">
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest pl-10 h-16">Security Action</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-16">Origin Node</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-16">Operator</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-16 text-right pr-10">Telemetry Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [1,2,3,4,5,6].map(i => (
                    <TableRow key={i} className="border-slate-200 dark:border-slate-900">
                      <TableCell colSpan={4} className="h-24 p-0">
                         <div className="h-full w-full bg-slate-200/50 dark:bg-slate-900/10 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center">
                       <div className="flex flex-col items-center gap-6">
                          <Terminal className="h-16 w-16 text-slate-800 dark:text-white animate-pulse" />
                          <div className="space-y-1">
                             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching logs detected</p>
                             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">All system nodes currently silent.</p>
                          </div>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((log) => (
                    <TableRow key={log.id} className="hover:bg-rose-500/[0.02] border-slate-200 dark:border-slate-900 transition-all group">
                      <TableCell className="pl-10 py-6">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-rose-500 group-hover:border-rose-500/30 transition-all">
                              <ShieldCheck className="h-5 w-5" />
                           </div>
                           <div className="space-y-0.5">
                              <div className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{log.action}</div>
                              <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{log.entity} <span className="text-slate-800 dark:text-white ml-1">ID: {log.entityId?.slice(-8)}</span></div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <Database className="h-3 w-3 text-slate-600" />
                            <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest">{log.business?.name || "GLOBAL INFRA"}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-slate-600" />
                            <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest">{log.user?.name || "SYSTEM CORE"}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex flex-col items-end">
                           <span className="text-xs font-black text-slate-900 dark:text-white italic tracking-tighter">{format(new Date(log.createdAt), "HH:mm:ss")}</span>
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{format(new Date(log.createdAt), "dd MMM yyyy")}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </GlassCard>

        {/* Footer Info */}
        <div className="flex justify-center">
           <div className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-600 font-black text-[9px] uppercase tracking-[0.3em]">
              Showing last 50 high-priority system events
           </div>
        </div>
      </div>
    </div>
  );
}
