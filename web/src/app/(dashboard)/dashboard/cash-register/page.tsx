"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  Banknote, 
  ShieldCheck, 
  Clock, 
  Plus, 
  RefreshCw, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShoppingCart, 
  FileText, 
  Download, 
  History, 
  User, 
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Search,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  getCurrentSession, 
  openSession, 
  getTillHistory, 
  getTillStats 
} from "@/lib/actions/cash-register";
import { CloseRegisterModal } from "@/components/pos/CloseRegisterModal";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CashRegisterPage() {
  const { data: session } = useSession();
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");

  // Open Shift Modal State
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [startingCash, setStartingCash] = useState("");
  const [openNotes, setOpenNotes] = useState("");
  const [isOpening, setIsOpening] = useState(false);

  // Close Shift Modal State
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // Detail Modal State
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [cur, st, hist] = await Promise.all([
        getCurrentSession(),
        getTillStats(),
        getTillHistory(50),
      ]);
      setCurrentSession(cur);
      setStats(st);
      setHistory(hist || []);
    } catch (err: any) {
      console.error("Error fetching cash register data:", err);
      toast.error("Failed to load cash register data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const floatAmount = parseFloat(startingCash);
    if (isNaN(floatAmount) || floatAmount < 0) {
      toast.error("Please enter a valid starting cash float");
      return;
    }

    setIsOpening(true);
    try {
      await openSession(floatAmount, openNotes || undefined);
      toast.success("Cash drawer opened. Shift started successfully!");
      setIsOpenShiftModalOpen(false);
      setStartingCash("");
      setOpenNotes("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to open register shift");
    } finally {
      setIsOpening(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    if (history.length === 0) return toast.info("No till history to export");
    const headers = ["Shift ID", "Status", "Opened At", "Closed At", "Starting Float (Le)", "Expected Ending (Le)", "Actual Ending (Le)", "Variance (Le)", "Notes"];
    const rows = history.map(h => [
      h.id,
      h.status,
      h.openedAt ? format(new Date(h.openedAt), "yyyy-MM-dd HH:mm:ss") : "",
      h.closedAt ? format(new Date(h.closedAt), "yyyy-MM-dd HH:mm:ss") : "OPEN",
      h.startingCash || 0,
      h.expectedEndingCash || 0,
      h.actualEndingCash || 0,
      h.variance || 0,
      `"${(h.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Till_Reconciliation_Report_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Till history exported to CSV");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
              Point of Sale &amp; Till Management
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-[1000] tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
            Cash Register &amp; Till Shifts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cash float tracking, blind end-of-shift reconciliation, and discrepancy audit controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-10 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
          >
            <RefreshCw className={cn("h-4 w-4 mr-1.5", refreshing && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="h-10 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
          >
            <Download className="h-4 w-4 mr-1.5 text-indigo-500" />
            <span>Export CSV</span>
          </Button>

          <Link href="/dashboard/pos">
            <Button
              className="h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              <span>Launch POS Terminal</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Shift Status Banner */}
      <Card className="rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Wallet size={200} />
        </div>
        <CardContent className="p-6 sm:p-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl",
                    currentSession
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  )}
                >
                  {currentSession ? "Active Shift In Progress" : "No Active Shift — Register Closed"}
                </Badge>
                {currentSession && (
                  <span className="text-xs text-indigo-200 font-mono font-bold flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-400" />
                    Started {format(new Date(currentSession.openedAt), "MMM d, yyyy • h:mm a")}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-[1000] tracking-tight uppercase">
                  {currentSession ? "Drawer Open & Accepting Tender" : "Till Locked / Drawer Inactive"}
                </h2>
                <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
                  {currentSession
                    ? `Cashier ${session?.user?.name || "Active Staff"} is currently managing this shift. All cash sales are recorded against this drawer session.`
                    : "Opening a shift establishes the starting float for the cash drawer and enables sales reconciliation."}
                </p>
              </div>

              {currentSession && (
                <div className="flex items-center gap-6 pt-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300/80">Starting Float</span>
                    <p className="text-xl font-[1000] font-mono text-emerald-400">
                      Le {Math.round(currentSession.startingCash).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300/80">Reconciliation Mode</span>
                    <p className="text-xs font-bold text-white flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                      Blind Audit Active
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {currentSession ? (
                <>
                  <Link href="/dashboard/pos">
                    <Button
                      variant="outline"
                      className="h-12 px-5 rounded-2xl border-white/20 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Go to POS
                    </Button>
                  </Link>

                  <Button
                    onClick={() => setIsCloseModalOpen(true)}
                    className="h-12 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-600/30 transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Close Shift &amp; Reconcile</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsOpenShiftModalOpen(true)}
                  className="h-13 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-[1000] text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  <span>Open Register / Start Shift</span>
                </Button>
              )}
            </div>

          </div>
        </CardContent>
      </Card>

      {/* KPI Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-widest">Active Float</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
              <Banknote size={16} />
            </div>
          </div>
          <div className="text-2xl font-[1000] text-slate-900 dark:text-white font-mono">
            {currentSession ? `Le ${Math.round(currentSession.startingCash).toLocaleString()}` : "Le 0"}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {currentSession ? "Current drawer opening cash" : "Shift currently closed"}
          </p>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-widest">Total Shifts (This Month)</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-2xl font-[1000] text-slate-900 dark:text-white font-mono">
            {stats?.thisMonthCount ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {stats?.totalSessions ?? 0} total all-time sessions
          </p>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-widest">Monthly Till Variance</span>
            <div className={cn(
              "p-2 rounded-xl",
              (stats?.thisMonthVariance ?? 0) === 0
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600"
                : (stats?.thisMonthVariance ?? 0) > 0
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600"
                : "bg-rose-50 dark:bg-rose-950/50 text-rose-600"
            )}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className={cn(
            "text-2xl font-[1000] font-mono",
            (stats?.thisMonthVariance ?? 0) === 0
              ? "text-emerald-600 dark:text-emerald-400"
              : (stats?.thisMonthVariance ?? 0) > 0
              ? "text-blue-600 dark:text-blue-400"
              : "text-rose-600 dark:text-rose-400"
          )}>
            {(stats?.thisMonthVariance ?? 0) >= 0 ? "+" : ""}Le {Math.round(stats?.thisMonthVariance ?? 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {(stats?.thisMonthVariance ?? 0) === 0 ? "100% Balanced Reconciliation" : (stats?.thisMonthVariance ?? 0) > 0 ? "Overall Over / Surplus" : "Overall Shortage"}
          </p>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-black uppercase tracking-widest">Audit Protocol</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-lg font-[1000] text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
            NRA &amp; Enterprise
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Tamper-resistant audit trails
          </p>
        </Card>
      </div>

      {/* Till History & Shifts Log */}
      <Card className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-500" />
              <span>Shift Reconciliation History</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Complete audit ledger of opened, closed, and reconciled cash drawer sessions.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by notes or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
              {(["ALL", "OPEN", "CLOSED"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                    statusFilter === filter
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-black"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
              <span className="text-xs font-bold">Loading till audit records...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Wallet className="h-10 w-10 mx-auto opacity-30" />
              <p className="text-xs font-bold uppercase tracking-wider">No shift sessions found</p>
              <p className="text-[11px] text-slate-500">Open a shift to start recording register audit transactions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opened</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Closed</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Starting Float</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Expected</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actual Count</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Discrepancy</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((shift) => {
                    const isOpen = shift.status === "OPEN";
                    const hasVariance = shift.variance !== null && shift.variance !== undefined;
                    const varianceVal = shift.variance || 0;

                    return (
                      <TableRow 
                        key={shift.id} 
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <TableCell className="py-4">
                          <Badge
                            className={cn(
                              "text-[9px] font-black uppercase tracking-wider rounded-lg px-2 py-0.5",
                              isOpen
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            )}
                          >
                            {shift.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
                          {shift.openedAt ? format(new Date(shift.openedAt), "MMM d, yyyy • h:mm a") : "-"}
                        </TableCell>

                        <TableCell className="text-xs font-mono font-medium text-slate-500">
                          {shift.closedAt ? format(new Date(shift.closedAt), "MMM d, yyyy • h:mm a") : (
                            <span className="text-emerald-500 font-bold uppercase text-[10px]">Active Shift</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs font-mono font-bold text-right text-slate-700 dark:text-slate-300">
                          Le {Math.round(shift.startingCash || 0).toLocaleString()}
                        </TableCell>

                        <TableCell className="text-xs font-mono font-bold text-right text-slate-700 dark:text-slate-300">
                          {shift.expectedEndingCash !== null ? `Le ${Math.round(shift.expectedEndingCash).toLocaleString()}` : "-"}
                        </TableCell>

                        <TableCell className="text-xs font-mono font-bold text-right text-slate-900 dark:text-white">
                          {shift.actualEndingCash !== null ? `Le ${Math.round(shift.actualEndingCash).toLocaleString()}` : "-"}
                        </TableCell>

                        <TableCell className="text-right">
                          {hasVariance ? (
                            varianceVal === 0 ? (
                              <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                                Balanced (Le 0)
                              </span>
                            ) : varianceVal > 0 ? (
                              <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                                +Le {Math.round(varianceVal).toLocaleString()} (Over)
                              </span>
                            ) : (
                              <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                                -Le {Math.round(Math.abs(varianceVal)).toLocaleString()} (Short)
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedShift(shift);
                              setIsDetailModalOpen(true);
                            }}
                            className="h-8 px-2.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer"
                          >
                            Details
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* START / OPEN REGISTER SHIFT MODAL */}
      <Dialog open={isOpenShiftModalOpen} onOpenChange={setIsOpenShiftModalOpen}>
        <DialogContent className="sm:max-w-[440px] w-[95vw] rounded-[2rem] border-none shadow-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 flex flex-col gap-5">
          <div className="text-center space-y-1.5">
            <div className="mx-auto h-14 w-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
              <Unlock size={28} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Open Register Shift
            </h3>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Set the opening physical cash float in drawer
            </p>
          </div>

          <form onSubmit={handleOpenShift} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Starting Cash Float (Leones) <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 font-mono">
                  Le
                </span>
                <Input
                  required
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  className="h-13 pl-11 pr-4 bg-slate-50 dark:bg-slate-950 font-mono text-xl font-bold rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Fast Float Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[0, 100, 200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setStartingCash(amt.toString())}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    Le {amt >= 1000 ? `${amt / 1000}k` : amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Shift Opening Notes (Optional)
              </Label>
              <Textarea
                rows={2}
                placeholder="e.g. Morning Shift - Cashier Steven. Initial float verified."
                value={openNotes}
                onChange={(e) => setOpenNotes(e.target.value)}
                className="rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                disabled={isOpening}
                className="w-full h-13 rounded-2xl text-xs font-black tracking-wider uppercase bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isOpening ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Opening Register...
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4" />
                    Start Shift &amp; Open Drawer
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpenShiftModalOpen(false)}
                className="w-full h-9 rounded-xl text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CLOSE REGISTER SHIFT MODAL */}
      <CloseRegisterModal
        isOpen={isCloseModalOpen}
        onClose={() => {
          setIsCloseModalOpen(false);
          fetchData();
        }}
        sessionId={currentSession?.id || null}
      />

      {/* SHIFT DETAILS AUDIT MODAL */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-[2rem] border-none shadow-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 flex flex-col gap-5">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider">
                Shift Audit Log
              </Badge>
              <Badge className={cn("text-[10px] font-bold uppercase", selectedShift?.status === "OPEN" ? "bg-emerald-500" : "bg-slate-600")}>
                {selectedShift?.status}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-black uppercase text-slate-900 dark:text-white">
              Till Shift Breakdown
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Shift ID: {selectedShift?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedShift && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Opened At:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {format(new Date(selectedShift.openedAt), "MMM d, yyyy • h:mm:ss a")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Closed At:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedShift.closedAt ? format(new Date(selectedShift.closedAt), "MMM d, yyyy • h:mm:ss a") : "Active (Not Closed)"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Starting Cash Float:</span>
                  <span className="font-mono font-bold">Le {Math.round(selectedShift.startingCash || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Expected Ending Cash:</span>
                  <span className="font-mono font-bold">
                    {selectedShift.expectedEndingCash !== null ? `Le ${Math.round(selectedShift.expectedEndingCash).toLocaleString()}` : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Actual Counted Cash:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedShift.actualEndingCash !== null ? `Le ${Math.round(selectedShift.actualEndingCash).toLocaleString()}` : "-"}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-black uppercase text-[10px]">Net Reconciliation Variance:</span>
                  <span className={cn(
                    "font-mono font-black text-sm",
                    (selectedShift.variance || 0) === 0 ? "text-emerald-600" : (selectedShift.variance || 0) > 0 ? "text-blue-600" : "text-rose-600"
                  )}>
                    {(selectedShift.variance || 0) >= 0 ? "+" : ""}Le {Math.round(selectedShift.variance || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedShift.notes && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                    Shift Remarks:
                  </span>
                  <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                    {selectedShift.notes}
                  </p>
                </div>
              )}

              <Button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Close Summary
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
