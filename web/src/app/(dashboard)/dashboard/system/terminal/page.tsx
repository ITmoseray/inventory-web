"use client";

import { useState, useEffect } from "react";
import {
  Terminal, Shield, Search, RefreshCw, Loader2, Eye, X,
  Lock, User, FileCode, Activity, Filter, Database, AlertCircle, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/layout/ModuleHeader";
import { getAuditLogs } from "@/lib/actions/audit";
import { motion, AnimatePresence } from "framer-motion";

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  createdAt: string;
  userName: string;
  userEmail: string;
};

export default function SecureTerminalPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data as AuditLog[]);
    } catch {
      toast.error("Failed to load secure terminal logs.");
    } finally {
      setLoading(false);
    }
  }

  // Extract unique entities for filtering
  const entities = Array.from(new Set(logs.map(l => l.entity).filter(Boolean)));

  const filteredLogs = logs.filter(l => {
    const action = l.action.toLowerCase();
    const entity = l.entity.toLowerCase();
    const user = l.userName.toLowerCase();
    const email = l.userEmail.toLowerCase();
    const q = search.toLowerCase();
    
    const matchesSearch = 
      action.includes(q) || 
      entity.includes(q) || 
      user.includes(q) || 
      email.includes(q);

    const matchesEntity = entityFilter === "ALL" || l.entity === entityFilter;

    return matchesSearch && matchesEntity;
  });

  const getActionBadgeColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("ADD") || act.includes("SOURCE")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
    if (act.includes("DELETE") || act.includes("REMOVE") || act.includes("REVOKE")) return "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400";
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("MODIFY")) return "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
    if (act.includes("LOGIN") || act.includes("AUTH")) return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  return (
    <div className="space-y-6 p-4 md:p-8 bg-slate-50/30 dark:bg-slate-950/50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-[1000] tracking-tight text-slate-900 dark:text-white uppercase italic">
                Secure <span className="text-indigo-600">Terminal</span>
              </h1>
              <Badge className="bg-rose-500/10 hover:bg-rose-500/10 text-rose-600 border border-rose-500/20 font-black text-[9px] uppercase tracking-widest gap-1 py-0.5 px-2">
                <Shield className="h-2.5 w-2.5" /> Enforced
              </Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
              Cryptographic audit logs and security-critical session telemetry.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={load}
          disabled={loading}
          className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white dark:bg-slate-900"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Reload Logs
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
              <Terminal className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{loading ? "—" : logs.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total Events</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <User className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? "—" : new Set(logs.map(l => l.userEmail)).size}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Active Operators</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <Database className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? "—" : new Set(logs.map(l => l.entity)).size}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Monitored Entities</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30">
              <Lock className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">SHA-256</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Chain Security</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Filter by operator, email, action or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-[10px] uppercase tracking-widest shadow-sm text-slate-600 dark:text-slate-300"
          >
            <option value="ALL">All Entities</option>
            {entities.map(ent => (
              <option key={ent} value={ent}>{ent}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-black uppercase tracking-widest">Decrypting audit logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                <TableRow>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest pl-6">Timestamp</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Operator</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Action</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Entity</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest">Entity ID</TableHead>
                  <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest pr-6 text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Activity className="h-7 w-7 text-slate-300" />
                        </div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                          {search || entityFilter !== "ALL" ? "No matching audit records" : "Secure terminal logs are empty"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {format(new Date(log.createdAt), "dd MMM yyyy")}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {format(new Date(log.createdAt), "hh:mm a")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{log.userName}</span>
                          <span className="text-[10px] text-slate-400">{log.userEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("font-black text-[9px] uppercase tracking-widest border-0", getActionBadgeColor(log.action))}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {log.entity}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {log.entityId ? log.entityId.slice(0, 12) + "..." : "—"}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {(log.oldData || log.newData) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log);
                              setIsDetailsOpen(true);
                            }}
                            className="rounded-xl h-9 px-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600"
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">No diff</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
        {!loading && filteredLogs.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {filteredLogs.length} of {logs.length} audit logs
            </p>
          </div>
        )}
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-0 shadow-2xl bg-white dark:bg-slate-900 max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="h-5 w-5 text-indigo-500" /> Audit Log Payload
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-black">Action</span>
                  <span className="text-slate-800 dark:text-white">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-black">Operator</span>
                  <span className="text-slate-800 dark:text-white">{selectedLog.userName} ({selectedLog.userEmail})</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-black">Entity & ID</span>
                  <span className="text-slate-800 dark:text-white font-mono">{selectedLog.entity} ({selectedLog.entityId || "N/A"})</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-black">Timestamp</span>
                  <span className="text-slate-800 dark:text-white">
                    {format(new Date(selectedLog.createdAt), "dd MMM yyyy, hh:mm a")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLog.oldData && (
                  <div className="space-y-1.5">
                    <span className="text-slate-400 block uppercase text-[10px] font-black flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500" /> Previous State
                    </span>
                    <pre className="p-4 bg-slate-50 dark:bg-slate-800/20 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-mono overflow-auto max-h-[300px] border border-slate-100 dark:border-slate-800">
                      {JSON.stringify(selectedLog.oldData, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedLog.newData && (
                  <div className="space-y-1.5">
                    <span className="text-slate-400 block uppercase text-[10px] font-black flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> New State
                    </span>
                    <pre className="p-4 bg-slate-50 dark:bg-slate-800/20 text-slate-700 dark:text-slate-350 rounded-2xl text-xs font-mono overflow-auto max-h-[300px] border border-slate-100 dark:border-slate-800">
                      {JSON.stringify(selectedLog.newData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="rounded-xl">
              <X className="mr-1 h-4 w-4" /> Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
