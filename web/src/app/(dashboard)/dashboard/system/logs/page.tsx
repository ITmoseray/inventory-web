"use client";

import { useState, useEffect } from "react";
import { 
  Shield, Search, Filter, History, User, 
  Activity, Clock, AlertCircle, CheckCircle2, 
  Eye, ArrowRight, Database, Lock, RefreshCw, 
  FileJson, Download, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { getAuditLogs } from "@/lib/actions/audit";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { EnterpriseKpiCard, EnterpriseBadge } from "@/components/enterprise";

export default function AuditLogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data || []);
    } catch (error: any) {
      toast.error("Failed to sync audit logs stream.");
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter(l => 
    l.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.entity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportLogsCSV = () => {
    if (filteredLogs.length === 0) return toast.error("No logs to export.");
    const headers = ["ID,Action,Entity,EntityID,User,Timestamp"];
    const rows = filteredLogs.map(l => 
      `"${l.id}","${l.action}","${l.entity}","${l.entityId || ''}","${l.userName || ''}","${format(new Date(l.createdAt), "yyyy-MM-dd HH:mm:ss")}"`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyyMMdd-HHmmss")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit log report exported.");
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#2563EB] text-white shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Security Intelligence &amp; Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Audit Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Enterprise-grade activity tracking, authorized node mutations, and immutable compliance records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={fetchData} 
            variant="outline" 
            size="sm"
            className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold gap-2"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-slate-400", loading && "animate-spin")} />
            Sync Stream
          </Button>
          <Button 
            onClick={exportLogsCSV}
            size="sm"
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EnterpriseKpiCard
          label="Total Logged Events"
          value={logs.length.toString().padStart(2, "0")}
          change="Immutable Record"
          trend="neutral"
          tone="blue"
          icon={<Database className="h-5 w-5" />}
        />
        <EnterpriseKpiCard
          label="Critical Mutations"
          value={logs.filter(l => l.action === "DELETE" || l.action === "TERMINATE").length.toString().padStart(2, "0")}
          change="Deletions & Revocations"
          trend="neutral"
          tone="rose"
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <EnterpriseKpiCard
          label="System Health"
          value="99.9%"
          change="Operational"
          trend="up"
          tone="emerald"
          icon={<Activity className="h-5 w-5" />}
        />
        <EnterpriseKpiCard
          label="Security Protocol"
          value="RBAC Tier 1"
          change="Verified"
          trend="neutral"
          tone="indigo"
          icon={<Lock className="h-5 w-5" />}
        />
      </div>

      {/* Main Table Card (Figma Make Specification) */}
      <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by action, module, or user..." 
              className="h-10 pl-9 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Stream Active
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 font-bold text-xs text-slate-500 px-6">User</TableHead>
                  <TableHead className="h-11 font-bold text-xs text-slate-500">Action</TableHead>
                  <TableHead className="h-11 font-bold text-xs text-slate-500">Module</TableHead>
                  <TableHead className="h-11 font-bold text-xs text-slate-500">Description / Target</TableHead>
                  <TableHead className="h-11 font-bold text-xs text-slate-500">Date &amp; Time</TableHead>
                  <TableHead className="h-11 font-bold text-xs text-slate-500 text-right pr-6">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="h-16 border-b animate-pulse"><TableCell colSpan={6} /></TableRow>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                      <History className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-medium">No audit log records match your filter.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const initials = log.userName
                      ? log.userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                      : "SYS";
                    return (
                      <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 transition-colors h-16">
                        <TableCell className="px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B3F6E] to-[#2563EB] text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-xs">
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-slate-900 dark:text-white">{log.userName || "System"}</div>
                              <div className="text-[10px] text-slate-400">Node Operator</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider",
                            log.action === "CREATE" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                            log.action === "UPDATE" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" :
                            "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                          )}>
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold text-xs px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/40">
                            {log.entity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate font-mono">
                            {log.entityId ? `ID: ${log.entityId}` : "Operational Mutation"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                            {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all p-0"
                            onClick={() => {
                              setSelectedLog(log);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye size={15} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden bg-white text-slate-900 dark:bg-slate-950">
          <div className="bg-[#0B1629] p-6 text-white relative">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Audit Log Details</span>
              <h3 className="text-xl font-bold font-display">{selectedLog?.action} {selectedLog?.entity}</h3>
              <p className="text-xs font-mono text-slate-400">
                {selectedLog && format(new Date(selectedLog.createdAt), "PPPP p")}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Previous State</p>
                <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 overflow-x-auto max-h-36">
                  {selectedLog?.oldData ? JSON.stringify(selectedLog.oldData, null, 2) : "NULL STATE"}
                </pre>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">New State Mutation</p>
                <pre className="text-xs font-mono text-emerald-700 dark:text-emerald-300 overflow-x-auto max-h-36">
                  {selectedLog?.newData ? JSON.stringify(selectedLog.newData, null, 2) : "NULL STATE"}
                </pre>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authorized Operator</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedLog?.userName || "System Operator"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(false)} className="rounded-xl text-xs">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
