"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Crown, ShieldAlert, ShieldCheck, Eye, Activity, Users, 
  ArrowLeft, RefreshCw, Search, Filter, Lock, Unlock, 
  KeyRound, AlertTriangle, CheckCircle2, Clock, 
  Calendar, Building2, User, FileText, Download, LogOut,
  ChevronRight, Terminal, UserX, UserCheck, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  getMasterSuperAdminTelemetry, 
  verifyMasterSuperAdminLogin, 
  toggleOtherSuperAdminStatus, 
  overrideOtherSuperAdminPassword
} from "@/lib/actions/master-super-admin";

const MASTER_SUPER_ADMIN_EMAIL = "strangesteven001@gmail.com";
import { GlassCard } from "@/components/super-admin/glass-card";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function MasterSuperAdminMonitor() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Authentication & Clearance State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Telemetry Data State
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState<"stream" | "operators">("stream");

  // Filters
  const [selectedAdminFilter, setSelectedAdminFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals for actions on other super admins
  const [statusModal, setStatusModal] = useState<{ open: boolean; admin: any | null; newStatus: "ACTIVE" | "INACTIVE" }>({
    open: false,
    admin: null,
    newStatus: "INACTIVE"
  });
  const [passwordModal, setPasswordModal] = useState<{ open: boolean; admin: any | null; newPassword: string }>({
    open: false,
    admin: null,
    newPassword: ""
  });
  const [submittingAction, setSubmittingAction] = useState(false);

  const currentUserEmail = session?.user?.email?.toLowerCase();
  const isMasterUser = currentUserEmail === MASTER_SUPER_ADMIN_EMAIL.toLowerCase();

  // Load telemetry
  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getMasterSuperAdminTelemetry();
      setTelemetry(data);
    } catch (err: any) {
      if (!silent) toast.error(err.message || "Failed to load master telemetry.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Check if already unlocked in session
  useEffect(() => {
    const saved = sessionStorage.getItem("master_monitor_unlocked");
    if (saved === "true" && isMasterUser) {
      setIsUnlocked(true);
    }
  }, [isMasterUser]);

  useEffect(() => {
    if (isUnlocked) {
      loadData();
    }
  }, [isUnlocked]);

  // Real-time polling every 4 seconds when unlocked
  useEffect(() => {
    if (!isUnlocked || !autoRefresh) return;
    const interval = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [isUnlocked, autoRefresh]);

  // Handle Master Unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword) {
      toast.error("Please enter your Master Super Admin Security Passcode.");
      return;
    }

    try {
      setVerifying(true);
      const res = await verifyMasterSuperAdminLogin(masterPassword);
      if (res.success) {
        setIsUnlocked(true);
        sessionStorage.setItem("master_monitor_unlocked", "true");
        toast.success("Master Super Admin Observatory Unlocked.", {
          description: `Authorized as ${res.verifiedEmail}`
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed.");
    } finally {
      setVerifying(false);
    }
  };

  // Quick 1-click unlock if verified in session as master
  const handleQuickUnlock = () => {
    if (isMasterUser) {
      setIsUnlocked(true);
      sessionStorage.setItem("master_monitor_unlocked", "true");
      toast.success("Master Super Admin clearance verified.");
    } else {
      toast.error(`Access Denied: Only ${MASTER_SUPER_ADMIN_EMAIL} can access this monitor.`);
    }
  };

  // Handle Status Toggle
  const handleConfirmStatusToggle = async () => {
    if (!statusModal.admin) return;
    try {
      setSubmittingAction(true);
      await toggleOtherSuperAdminStatus(statusModal.admin.id, statusModal.newStatus);
      toast.success(`Super Admin ${statusModal.admin.email} marked ${statusModal.newStatus}.`);
      setStatusModal({ open: false, admin: null, newStatus: "INACTIVE" });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Password Override
  const handleConfirmPasswordOverride = async () => {
    if (!passwordModal.admin || passwordModal.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    try {
      setSubmittingAction(true);
      await overrideOtherSuperAdminPassword(passwordModal.admin.id, passwordModal.newPassword);
      toast.success(`Password updated for ${passwordModal.admin.email}.`);
      setPasswordModal({ open: false, admin: null, newPassword: "" });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to override password.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filter activities
  const filteredActivities = (telemetry?.activities || []).filter((act: any) => {
    // Admin filter
    if (selectedAdminFilter !== "ALL" && act.operator.id !== selectedAdminFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== "ALL") {
      const actionUpper = act.action.toUpperCase();
      if (categoryFilter === "APPROVALS" && !actionUpper.includes("APPROV") && !actionUpper.includes("TRIAL")) return false;
      if (categoryFilter === "BACKUPS" && !actionUpper.includes("BACKUP")) return false;
      if (categoryFilter === "PASSWORDS" && !actionUpper.includes("PASSWORD")) return false;
      if (categoryFilter === "IMPLEMENTATIONS" && !actionUpper.includes("IMPLEMENTATION")) return false;
      if (categoryFilter === "BROADCASTS" && !actionUpper.includes("BROADCAST") && !actionUpper.includes("MAINTENANCE")) return false;
      if (categoryFilter === "DELETIONS" && !actionUpper.includes("DELET")) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = act.action.toLowerCase().includes(q);
      const matchOperator = act.operator.name?.toLowerCase().includes(q) || act.operator.email?.toLowerCase().includes(q);
      const matchEntity = act.entity?.toLowerCase().includes(q) || act.business?.name?.toLowerCase().includes(q);
      if (!matchAction && !matchOperator && !matchEntity) return false;
    }

    return true;
  });

  // Action badge styling helper
  const getActionBadgeColor = (action: string) => {
    const a = action.toUpperCase();
    if (a.includes("APPROV") || a.includes("SIGN") || a.includes("COMPLET") || a.includes("ACTIVAT")) {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
    if (a.includes("PASSWORD") || a.includes("RESET") || a.includes("OVERRIDE")) {
      return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
    }
    if (a.includes("DELET") || a.includes("REMOV") || a.includes("SUSPEND")) {
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    }
    if (a.includes("BACKUP") || a.includes("RESTORE")) {
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }
    if (a.includes("TRIAL") || a.includes("EXTEND") || a.includes("MAINTENANCE")) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
    return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
  };

  // ─────────────────────────────────────────────────────────────
  // 1. MASTER AUTHENTICATION / ACCESS GATEWAY
  // ─────────────────────────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-200 relative overflow-hidden font-sans">
        {/* Background Radial Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-md w-full p-6 sm:p-8 rounded-[2.5rem] bg-slate-900/60 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-6 relative z-10 text-center">
          
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-amber-500 to-indigo-600 p-0.5 shadow-xl shadow-amber-500/10">
              <div className="h-full w-full rounded-[1.4rem] bg-slate-950 flex items-center justify-center text-amber-400">
                <Crown className="h-8 w-8" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-400 uppercase tracking-widest">
                <ShieldAlert className="h-3 w-3" />
                Supreme Master Clearance
              </div>
              <h1 className="text-2xl font-[1000] text-white uppercase italic tracking-tight mt-2">
                Master Super Admin <span className="text-amber-400">Observatory</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Authorized Surveillance &amp; Control of all Super Admin Operations
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Designated Supreme Master</span>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">MASTER 01</span>
            </div>
            <p className="text-xs font-mono font-bold text-white truncate">
              {MASTER_SUPER_ADMIN_EMAIL}
            </p>
            <div className="text-[10px] text-slate-400 pt-1">
              Active Session: <strong className="text-slate-200">{session?.user?.email || "Checking..."}</strong>
            </div>
          </div>

          {isMasterUser ? (
            <div className="space-y-4">
              <form onSubmit={handleUnlock} className="space-y-3">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                    Security Passcode
                  </label>
                  <Input 
                    type="password"
                    placeholder="Enter Master Password..."
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    className="h-11 rounded-xl bg-slate-950/80 border-slate-800 text-white font-bold text-xs"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  disabled={verifying}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all"
                >
                  {verifying ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Unlock className="mr-2 h-4 w-4" /> Unlock Master Surveillance
                    </>
                  )}
                </Button>
              </form>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[9px] font-black uppercase tracking-widest text-slate-500 absolute">
                  OR
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleQuickUnlock}
                className="w-full h-10 rounded-xl border-slate-800 text-amber-400 hover:bg-amber-500/10 font-black text-[10px] uppercase tracking-widest"
              >
                <Crown className="mr-2 h-3.5 w-3.5" /> Instant Verify Dr. Strange Session
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-left space-y-2">
              <div className="flex items-center gap-2 font-black uppercase text-[10px]">
                <AlertTriangle className="h-4 w-4" />
                Access Restricted
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                You are currently logged in as <strong>{session?.user?.email}</strong>. This monitor is exclusively reserved for the Supreme Master Super Admin (<strong>{MASTER_SUPER_ADMIN_EMAIL}</strong>).
              </p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs">
            <Link 
              href="/super-admin"
              className="text-slate-400 hover:text-white inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider"
            >
              <ArrowLeft className="h-3 w-3" /> Return to Super Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. UNLOCKED MASTER OBSERVATORY DASHBOARD
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] px-3 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-8 text-slate-900 dark:text-slate-200 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">

        {/* Master Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link 
                href="/super-admin"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                title="Back to Nexus Super Admin"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 text-[10px] font-black text-amber-500 uppercase tracking-widest shadow-sm">
                <Crown className="h-3.5 w-3.5" />
                <span>Supreme Master Surveillance Terminal</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-[1000] text-slate-900 dark:text-white tracking-tight uppercase italic">
              Master <span className="text-amber-500">Super Admin</span> Monitor
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
              Live surveillance observatory logging all actions taken by other Super Admins: store approvals, trial extensions, password resets, database backups, and record overrides.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Polling Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
              <div className={cn("h-2.5 w-2.5 rounded-full", autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {autoRefresh ? "Live Feed (4s)" : "Paused"}
              </span>
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="text-[9px] font-bold text-indigo-500 hover:underline ml-1 uppercase"
              >
                {autoRefresh ? "Pause" : "Resume"}
              </button>
            </div>

            <Button
              variant="outline"
              onClick={() => loadData()}
              disabled={loading}
              className="h-10 px-4 rounded-xl font-bold text-xs gap-2"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                sessionStorage.removeItem("master_monitor_unlocked");
                setIsUnlocked(false);
                toast.info("Master Observatory Locked.");
              }}
              className="h-10 px-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-bold text-xs gap-1.5"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Lock Terminal</span>
            </Button>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Super Admins</span>
              <Users className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-[1000] text-slate-900 dark:text-white">
              {telemetry?.metrics?.totalSuperAdmins || 0}
            </p>
            <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
              {telemetry?.metrics?.otherSuperAdminsCount || 0} Under Surveillance
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Online Now</span>
              <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
            </div>
            <p className="text-2xl sm:text-3xl font-[1000] text-emerald-500">
              {telemetry?.metrics?.onlineSuperAdmins || 0}
            </p>
            <p className="text-[9px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-widest">
              Active Heartbeats
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Actions Today</span>
              <Terminal className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-[1000] text-slate-900 dark:text-white">
              {telemetry?.metrics?.actionsToday || 0}
            </p>
            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">
              {telemetry?.metrics?.actionsThisWeek || 0} This Past Week
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Most Active Admin</span>
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white truncate">
              {telemetry?.metrics?.mostActiveAdminName || "None"}
            </p>
            <p className="text-[9px] font-bold text-slate-400 truncate">
              {telemetry?.metrics?.mostActiveAdminActions || 0} Total Logged Actions
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("stream")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                activeTab === "stream"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
              )}
            >
              📡 Live Activity Stream ({filteredActivities.length})
            </button>
            <button
              onClick={() => setActiveTab("operators")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                activeTab === "operators"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
              )}
            >
              👥 Super Admin Operators ({telemetry?.superAdmins?.length || 0})
            </button>
          </div>

          {activeTab === "stream" && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter by Operator */}
              <select
                value={selectedAdminFilter}
                onChange={(e) => setSelectedAdminFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Super Admins</option>
                {telemetry?.superAdmins?.map((admin: any) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email})
                  </option>
                ))}
              </select>

              {/* Filter by Category */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Action Types</option>
                <option value="APPROVALS">Store Approvals &amp; Trials</option>
                <option value="BACKUPS">Database Snapshots</option>
                <option value="PASSWORDS">Password Resets</option>
                <option value="IMPLEMENTATIONS">Implementations</option>
                <option value="BROADCASTS">Broadcasts &amp; Maintenance</option>
                <option value="DELETIONS">Deletions</option>
              </select>
            </div>
          )}
        </div>

        {/* VIEW 1: LIVE ACTIVITY STREAM */}
        {activeTab === "stream" && (
          <div className="space-y-4">
            {/* Search Filter Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search audit actions, affected stores, operator names, or emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold text-xs"
              />
            </div>

            {filteredActivities.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <ShieldCheck className="h-12 w-12 text-emerald-500/30 mx-auto" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                  No matching super admin activity logs found.
                </p>
                <p className="text-[11px] text-slate-400">
                  Try adjusting your search query or operator filter.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((act: any) => (
                  <div
                    key={act.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-amber-500/30 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      {/* Operator Identity */}
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-sm",
                          act.operator.isMaster 
                            ? "bg-gradient-to-br from-amber-500 to-indigo-600 text-white ring-2 ring-amber-400/40" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                        )}>
                          {act.operator.name ? act.operator.name.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {act.operator.name || "Super Admin"}
                            </span>
                            {act.operator.isMaster ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[8px] font-black uppercase tracking-wider">
                                👑 Supreme Master
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-[8px] font-black uppercase tracking-wider">
                                Super Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-slate-400">
                            {act.operator.email}
                          </p>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                          {format(new Date(act.createdAt), "MMM d, yyyy • HH:mm:ss")}
                        </span>
                        <p className="text-[9px] text-slate-400">
                          {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Action Detail Banner */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shrink-0",
                          getActionBadgeColor(act.action)
                        )}>
                          {act.entity || "SYSTEM"}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {act.action}
                        </span>
                      </div>

                      {act.business && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold shrink-0">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span>Store: {act.business.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Optional Delta / Payload Details */}
                    {(act.oldData || act.newData) && (
                      <details className="text-[10px] text-slate-400 group/details cursor-pointer pt-1">
                        <summary className="font-black uppercase tracking-wider hover:text-indigo-400 transition-colors">
                          Inspect Execution Payload Data
                        </summary>
                        <div className="mt-2 p-3 rounded-xl bg-slate-950 font-mono text-[10px] text-emerald-400 overflow-x-auto border border-slate-800">
                          <pre>{JSON.stringify({ oldData: act.oldData, newData: act.newData }, null, 2)}</pre>
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: SUPER ADMIN OPERATOR DIRECTORY */}
        {activeTab === "operators" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {telemetry?.superAdmins?.map((admin: any) => (
                <div
                  key={admin.id}
                  className={cn(
                    "p-5 rounded-3xl bg-white dark:bg-slate-900/60 border shadow-sm space-y-4 transition-all relative overflow-hidden",
                    admin.isMaster
                      ? "border-amber-500/40 ring-1 ring-amber-500/20"
                      : "border-slate-200 dark:border-slate-800"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-base uppercase shadow-md shrink-0",
                        admin.isMaster 
                          ? "bg-gradient-to-br from-amber-500 to-indigo-600 text-white"
                          : "bg-indigo-600 text-white"
                      )}>
                        {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {admin.name}
                          </h3>
                          {admin.isMaster && (
                            <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs font-mono text-slate-400 truncate">
                          {admin.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {admin.isOnline ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[9px] font-black uppercase tracking-wider">
                          Offline
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/60 text-xs">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Logged Actions</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white block mt-0.5">
                        {admin.totalActionsCount} ops
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Account Status</span>
                      <span className={cn(
                        "text-xs font-black uppercase block mt-0.5",
                        admin.status === "ACTIVE" ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {admin.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-400">
                    <p>Last Login: <strong className="text-slate-300">{admin.lastLoginAt ? format(new Date(admin.lastLoginAt), "PPp") : "Never"}</strong></p>
                    <p>Last Active: <strong className="text-slate-300">{admin.lastActiveAt ? formatDistanceToNow(new Date(admin.lastActiveAt), { addSuffix: true }) : "N/A"}</strong></p>
                  </div>

                  {/* Actions for other super admins */}
                  {!admin.isMaster && (
                    <div className="pt-2 flex items-center gap-2 border-t border-slate-200 dark:border-slate-800">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAdminFilter(admin.id);
                          setActiveTab("stream");
                        }}
                        className="flex-1 h-8 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                      >
                        <Eye className="h-3 w-3 mr-1" /> View Activity
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPasswordModal({ open: true, admin, newPassword: "" })}
                        className="h-8 px-2.5 rounded-xl text-[10px] font-bold"
                        title="Override Password"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setStatusModal({
                          open: true,
                          admin,
                          newStatus: admin.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                        })}
                        className={cn(
                          "h-8 px-2.5 rounded-xl text-[10px] font-bold",
                          admin.status === "ACTIVE" ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" : "text-emerald-500 hover:bg-emerald-50"
                        )}
                        title={admin.status === "ACTIVE" ? "Deactivate Super Admin" : "Reactivate Super Admin"}
                      >
                        {admin.status === "ACTIVE" ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal 1: Status Toggle Confirmation */}
      <Dialog open={statusModal.open} onOpenChange={(o) => setStatusModal({ ...statusModal, open: o })}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {statusModal.newStatus === "INACTIVE" ? "Deactivate Super Admin" : "Reactivate Super Admin"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to change account status for <strong className="text-slate-800 dark:text-slate-200">{statusModal.admin?.email}</strong> to <strong className="uppercase">{statusModal.newStatus}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setStatusModal({ open: false, admin: null, newStatus: "INACTIVE" })}
              className="h-10 px-4 rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusToggle}
              disabled={submittingAction}
              className={cn(
                "h-10 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white",
                statusModal.newStatus === "INACTIVE" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              {submittingAction ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Confirm Override"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Password Override */}
      <Dialog open={passwordModal.open} onOpenChange={(o) => setPasswordModal({ ...passwordModal, open: o })}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Override Super Admin Password
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Set a new secure password for <strong className="text-slate-800 dark:text-slate-200">{passwordModal.admin?.email}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              New Password (min. 6 characters)
            </label>
            <Input
              type="text"
              placeholder="Enter new password..."
              value={passwordModal.newPassword}
              onChange={(e) => setPasswordModal({ ...passwordModal, newPassword: e.target.value })}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setPasswordModal({ open: false, admin: null, newPassword: "" })}
              className="h-10 px-4 rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPasswordOverride}
              disabled={submittingAction || passwordModal.newPassword.length < 6}
              className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider"
            >
              {submittingAction ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Save New Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
