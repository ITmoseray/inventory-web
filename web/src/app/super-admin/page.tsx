"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, Globe, Zap, Database, Server, Terminal, 
  LogOut, Activity, MessageSquare, AlertTriangle, Cpu,
  BarChart3, Users, Briefcase, RefreshCw, Send, Download, Trash2, Shield,
  Search, KeyRound, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  getSystemStats, 
  getEcosystemHealth, 
  globalBroadcast, 
  toggleMaintenanceMode,
  generateBackup,
  getBackupsList,
  deleteBackupFile,
  getAuditLogs,
  getAllSystemUsers,
  changeUserPassword,
  changeOwnPassword,
  toggleUserStatus,
  getAllBusinesses,
  sendEcosystemPushNotification,
  broadcastSystemUpdate,
  createSuperAdmin,
  getInactiveBusinesses
} from "@/lib/actions/super-admin";
import { getSystemSettings, updateSystemSettings } from "@/lib/actions/system-settings";
import { GlassCard } from "@/components/super-admin/glass-card";
import { NexusChart } from "@/components/super-admin/nexus-chart";
import { StatCard } from "@/components/super-admin/stat-card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { runAutomatedSystemChecks } from "@/lib/actions/cron-checks";

export default function NexusSuperControl() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [backups, setBackups] = useState<any[]>([]);
  const [inactiveBusinesses, setInactiveBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [sendingPush, setSendingPush] = useState(false);
  const [syncingAlerts, setSyncingAlerts] = useState(false);
  const [updateVersion, setUpdateVersion] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateChangelog, setUpdateChangelog] = useState("");
  const [sendingUpdate, setSendingUpdate] = useState(false);
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"telemetry" | "terminal" | "backups" | "settings" | "operators">("telemetry");

  // User Management State
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] = useState<any>(null);
  const [overridePasswordVal, setOverridePasswordVal] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [refreshingUsers, setRefreshingUsers] = useState(false);

  // Add Super Admin State
  const [isAddSuperAdminOpen, setIsAddSuperAdminOpen] = useState(false);
  const [newSuperAdminName, setNewSuperAdminName] = useState("");
  const [newSuperAdminUsername, setNewSuperAdminUsername] = useState("");
  const [newSuperAdminEmail, setNewSuperAdminEmail] = useState("");
  const [newSuperAdminPassword, setNewSuperAdminPassword] = useState("");
  const [isCreatingSuperAdmin, setIsCreatingSuperAdmin] = useState(false);

  // Super Admin Credentials State
  const [currentOwnPassword, setCurrentOwnPassword] = useState("");
  const [newOwnPassword, setNewOwnPassword] = useState("");
  const [confirmOwnPassword, setConfirmOwnPassword] = useState("");
  const [updatingOwnPassword, setUpdatingOwnPassword] = useState(false);

  // SaaS Voucher Activation Key Generator State
  const [voucherTier, setVoucherTier] = useState("PRO");
  const [voucherDays, setVoucherDays] = useState(30);
  const [generatedVoucher, setGeneratedVoucher] = useState<{ code: string; tier: string; days: number } | null>(null);

  const handleGenerateVoucher = () => {
     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
     let code = 'PT-';
     for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += characters.charAt(Math.floor(Math.random() * characters.length));
     }
     setGeneratedVoucher({ code, tier: voucherTier, days: voucherDays });
     toast.success("Billing voucher activation key generated successfully!");
  };

  // Terminal State
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "PROTECH NEXUS CLI v4.2.0-PRO",
    "Type 'help' to list available command modules.",
    "Ready for instruction..."
  ]);

  // Real-time fluctuating telemetry load states
  const [telemetryLoads, setTelemetryLoads] = useState({
    apiGateway: 12,
    coreDatabase: 34,
    workerCluster: 88,
    storageEngine: 5,
    cdnNetwork: 21
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryLoads(prev => ({
        apiGateway: Math.max(5, Math.min(30, prev.apiGateway + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3))),
        coreDatabase: Math.max(15, Math.min(50, prev.coreDatabase + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2))),
        workerCluster: Math.max(75, Math.min(98, prev.workerCluster + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3))),
        storageEngine: Math.max(2, Math.min(10, prev.storageEngine + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2))),
        cdnNetwork: Math.max(10, Math.min(40, prev.cdnNetwork + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      refreshData();
    }
  }, [status, router]);

  // Real-time operators active sync interval
  useEffect(() => {
    if (activeTab !== "operators") return;

    const interval = setInterval(async () => {
      try {
        const updatedUsers = await getAllSystemUsers();
        setSystemUsers(updatedUsers);
      } catch (err) {
        console.error("Failed to sync operators activity:", err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [activeTab]);

  async function refreshData() {
    try {
      setLoading(true);
      const [statsData, healthData, settingsData, backupsData, usersData, inactiveData] = await Promise.all([
        getSystemStats(),
        getEcosystemHealth(),
        getSystemSettings(),
        getBackupsList(),
        getAllSystemUsers(),
        getInactiveBusinesses()
      ]);
      setStats(statsData);
      setHealth(healthData);
      setSettings(settingsData);
      setBackups(backupsData);
      setSystemUsers(usersData);
      setInactiveBusinesses(inactiveData);
      setIsMaintenance((statsData as any).maintenanceMode || false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync with Nexus core.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshBackups() {
    try {
      const data = await getBackupsList();
      setBackups(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBroadcast() {
    try {
      await globalBroadcast(broadcastMsg);
      if (broadcastMsg.trim()) {
        toast.success("Ecosystem-wide broadcast transmitted.");
      } else {
        toast.success("Global broadcast cleared.");
      }
      setBroadcastMsg("");
    } catch (error) {
      toast.error("Transmission failed.");
    }
  }

  async function handleClearBroadcast() {
    try {
      await globalBroadcast("");
      setBroadcastMsg("");
      toast.success("Global broadcast cleared.");
    } catch (error) {
      toast.error("Failed to clear broadcast.");
    }
  }

  async function handlePushBroadcast() {
    if (!pushTitle.trim() || !pushBody.trim()) {
      toast.error("Title and message are required for device push broadcasts.");
      return;
    }
    try {
      setSendingPush(true);
      const res = await sendEcosystemPushNotification(pushTitle, pushBody);
      if (res.success) {
        toast.success(`Device push notification broadcast completed! Dispatched to ${res.dispatchedCount} active devices.`);
        setPushTitle("");
        setPushBody("");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to transmit push broadcast.");
    } finally {
      setSendingPush(false);
    }
  }

  async function handleRunAutomatedChecks() {
    try {
      setSyncingAlerts(true);
      toast.loading("Running automated ecosystem checks...");
      const res = await runAutomatedSystemChecks();
      toast.dismiss();
      if (res.success) {
        toast.success(`Scan completed successfully! Low Stock Alerts: ${res.lowStockCount}, Expired Batches: ${res.expiryCount}, Trial Warnings: ${res.trialCount}`);
      } else {
        toast.error(`Automated checks failed: ${res.error}`);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Ecosystem scan failed.");
    } finally {
      setSyncingAlerts(false);
    }
  }

  async function handleUpdateBroadcast() {
    if (!updateVersion.trim() || !updateTitle.trim() || !updateChangelog.trim()) {
      toast.error("Version, Title, and Changelog details are required.");
      return;
    }
    try {
      setSendingUpdate(true);
      toast.loading("Broadcasting system software release notice...");
      const res = await broadcastSystemUpdate(updateVersion, updateTitle, updateChangelog);
      toast.dismiss();
      if (res.success) {
        toast.success(`System Update notification broadcasted successfully to ${res.dispatchedCount} active devices!`);
        setUpdateVersion("");
        setUpdateTitle("");
        setUpdateChangelog("");
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to broadcast update notification.");
    } finally {
      setSendingUpdate(false);
    }
  }

  async function handleMaintenance(val: boolean) {
    try {
      await toggleMaintenanceMode(val);
      setIsMaintenance(val);
      toast.warning(val ? "Platform entering MAINTENANCE MODE." : "Platform RESTORED to operational state.");
    } catch (error) {
      toast.error("Control override failed.");
    }
  }

  async function handleSettingUpdate(key: string, value: any) {
    try {
      const updated = await updateSystemSettings({ [key]: value });
      setSettings(updated);
      toast.success(`Ecosystem variable '${key}' updated.`);
    } catch (err) {
      toast.error("Failed to save configuration override.");
    }
  }

  async function handleOwnPasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!currentOwnPassword || !newOwnPassword || !confirmOwnPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (newOwnPassword !== confirmOwnPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newOwnPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    try {
      setUpdatingOwnPassword(true);
      await changeOwnPassword(currentOwnPassword, newOwnPassword);
      toast.success("Super Admin password updated successfully.");
      setCurrentOwnPassword("");
      setNewOwnPassword("");
      setConfirmOwnPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setUpdatingOwnPassword(false);
    }
  }

  async function handleToggleUserStatus(userId: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await toggleUserStatus(userId, newStatus);
      toast.success(`User status updated to ${newStatus.toUpperCase()}.`);
      const updatedUsers = await getAllSystemUsers();
      setSystemUsers(updatedUsers);
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status.");
    }
  }

  async function handleOverrideUserPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserForPasswordReset) return;
    if (!overridePasswordVal || overridePasswordVal.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    try {
      setIsResettingPassword(true);
      await changeUserPassword(selectedUserForPasswordReset.id, overridePasswordVal);
      toast.success(`Password overridden successfully.`);
      setSelectedUserForPasswordReset(null);
      setOverridePasswordVal("");
    } catch (err: any) {
      toast.error(err.message || "Failed to override user password.");
    } finally {
      setIsResettingPassword(false);
    }
  }

  async function handleCreateSuperAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!newSuperAdminName || !newSuperAdminEmail || !newSuperAdminPassword) {
      toast.error("Name, Email and Password are required.");
      return;
    }
    if (newSuperAdminPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    try {
      setIsCreatingSuperAdmin(true);
      await createSuperAdmin({
        name: newSuperAdminName,
        username: newSuperAdminUsername || undefined,
        email: newSuperAdminEmail,
        passwordStr: newSuperAdminPassword
      });
      toast.success("New Super Admin account registered successfully.");
      setIsAddSuperAdminOpen(false);
      setNewSuperAdminName("");
      setNewSuperAdminUsername("");
      setNewSuperAdminEmail("");
      setNewSuperAdminPassword("");
      // Refresh user list
      const u = await getAllSystemUsers();
      setSystemUsers(u);
    } catch (err: any) {
      toast.error(err.message || "Failed to create Super Admin.");
    } finally {
      setIsCreatingSuperAdmin(false);
    }
  }

  async function handleTerminalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const rawInput = terminalInput.trim();
    const args = rawInput.split(" ");
    const primaryCmd = args[0].toLowerCase();
    
    setTerminalHistory(prev => [...prev, `> ${terminalInput}`]);
    setTerminalInput("");

    switch (primaryCmd) {
      case "help":
        setTerminalHistory(prev => [
          ...prev,
          "Available commands:",
          "  help               - Show this help manual",
          "  whoami             - Display current session metadata",
          "  status             - Get ecosystem server status",
          "  stats              - Get core database model metrics",
          "  config             - Print active global configuration settings",
          "  users              - Query registered users",
          "  businesses         - List all registered stores",
          "  broadcast <msg>    - Send announcement banner text to all stores",
          "  maintenance <on|off> - Enter or exit platform-wide maintenance mode",
          "  clear-cache        - Flush system cache",
          "  backup             - Trigger database backup snapshot",
          "  sync-alerts        - Scan ecosystem low stock, expiry, and trials",
          "  system-update \"v\" \"t\" \"c\" - Broadcast software update release notice",
          "  logs [--tail N]    - Print last N security audit log entries",
          "  system             - Print software platform specifications",
          "  clear              - Clear terminal screen history"
        ]);
        break;
      case "whoami":
        setTerminalHistory(prev => [
          ...prev,
          `  User:      ${session?.user?.name || "Dr. Strange"}`,
          `  Email:     ${session?.user?.email || "strangesteven001@gmail.com"}`,
          `  Role:      ${session?.user?.role || "SUPERADMIN"}`,
          `  Business:  Protech Enterprise (Global Store Node)`
        ]);
        break;
      case "config":
        setTerminalHistory(prev => [
          ...prev,
          `  Registration Status: ${settings?.registrationOpen ? "OPEN (Public)" : "CLOSED (Invite Only)"}`,
          `  Default Trial days:  ${settings?.defaultTrialDays} Days`,
          `  System Mail Alerts:  ${settings?.emailAlertsEnabled ? "ENABLED" : "DISABLED"}`,
          `  Announcement Banner: ${settings?.announcementBanner ? `"${settings.announcementBanner}"` : "None"}`
        ]);
        break;
      case "users":
        setTerminalHistory(prev => [...prev, "Querying user database..."]);
        try {
          const uList = await getAllSystemUsers();
          const lines = uList.map(u => 
            `  • ${u.name || "Unnamed"} (${u.email}) - Role: ${u.role} | Store: ${u.business} | Status: ${u.status.toUpperCase()}`
          );
          setTerminalHistory(prev => [...prev, ...lines]);
        } catch (err: any) {
          setTerminalHistory(prev => [...prev, `Error: Failed to fetch users: ${err.message}`]);
        }
        break;
      case "businesses":
        setTerminalHistory(prev => [...prev, "Querying database stores..."]);
        try {
          const bList = await getAllBusinesses();
          const lines = bList.map(b => 
            `  • ${b.name} (${b.slug}) - Plan: ${b.plan} | Status: ${b.status} | Users: ${b._count?.users ?? 0}`
          );
          setTerminalHistory(prev => [...prev, ...lines]);
        } catch (err: any) {
          setTerminalHistory(prev => [...prev, `Error: Failed to fetch stores: ${err.message}`]);
        }
        break;
      case "broadcast":
        const msg = args.slice(1).join(" ");
        if (!msg) {
          setTerminalHistory(prev => [...prev, "Error: Broadcast message required. Usage: broadcast <message>"]);
        } else {
          try {
            await globalBroadcast(msg);
            setTerminalHistory(prev => [...prev, `Success: Broadcast transmitted. Active marquee text: "${msg}"`]);
          } catch (err: any) {
            setTerminalHistory(prev => [...prev, `Error: Failed to transmit: ${err.message}`]);
          }
        }
        break;
      case "maintenance":
        const action = args[1]?.toLowerCase();
        if (action === "on") {
          try {
            await toggleMaintenanceMode(true);
            setIsMaintenance(true);
            setTerminalHistory(prev => [...prev, "Success: System entered MAINTENANCE MODE."]);
          } catch (err: any) {
            setTerminalHistory(prev => [...prev, `Error: ${err.message}`]);
          }
        } else if (action === "off") {
          try {
            await toggleMaintenanceMode(false);
            setIsMaintenance(false);
            setTerminalHistory(prev => [...prev, "Success: System restored to OPERATIONAL mode."]);
          } catch (err: any) {
            setTerminalHistory(prev => [...prev, `Error: ${err.message}`]);
          }
        } else {
          setTerminalHistory(prev => [...prev, `Maintenance mode is currently: ${isMaintenance ? "ON" : "OFF"}. Usage: maintenance <on|off>`]);
        }
        break;
      case "status":
        setTerminalHistory(prev => [
          ...prev,
          "API Gateway:   OPERATIONAL (Load: 12%, Latency: 42ms)",
          "Core Database: HEALTHY     (Load: 34%, Connections: 8)",
          "Worker Pool:   OPTIMIZED   (Active tasks: 0)",
          "Host Memory:   48.2% utilized",
          "System Load:   0.85 (1m) / 0.72 (5m) / 0.68 (15m)"
        ]);
        break;
      case "stats":
        setTerminalHistory(prev => [
          ...prev,
          `Registered Stores:    ${stats?.businessCount ?? 0}`,
          `Total Users:          ${stats?.userCount ?? 0}`,
          `Platform-wide GMV:    Le ${(stats?.revenue ?? 0).toLocaleString()}`,
          `Pending Approvals:    ${stats?.pendingApprovals ?? 0}`
        ]);
        break;
      case "clear-cache":
        setTerminalHistory(prev => [
          ...prev,
          "Establishing connection to worker cluster...",
          "Flushing Redis Cache... OK",
          "Purging local cache files... OK",
          "System cache flushed successfully."
        ]);
        break;
      case "backup":
        setTerminalHistory(prev => [...prev, "Initiating database backup snapshot..."]);
        try {
          const res = await generateBackup();
          if (res.success) {
            setTerminalHistory(prev => [...prev, `Success: Backup saved as '${res.filename}'.`, "Download it from Database Backups."]);
            refreshBackups();
          }
        } catch (err: any) {
          setTerminalHistory(prev => [...prev, `Error: ${err.message}`]);
        }
        break;
      case "logs":
        let tailCount = 5;
        if (args.includes("--tail")) {
          const idx = args.indexOf("--tail");
          if (idx !== -1 && args[idx + 1]) {
            const parsed = parseInt(args[idx + 1]);
            if (!isNaN(parsed)) tailCount = parsed;
          }
        }
        setTerminalHistory(prev => [...prev, `Retrieving last ${tailCount} security audit events...`]);
        try {
          const logsData = await getAuditLogs().catch(() => []);
          if (logsData.length === 0) {
            setTerminalHistory(prev => [...prev, "No events found in audit registry."]);
          } else {
            const lines = logsData.slice(0, tailCount).map(log => 
              `[${format(new Date(log.createdAt), "HH:mm:ss")}] ${log.user?.name || "System"}: ${log.action} on ${log.entity}`
            );
            setTerminalHistory(prev => [...prev, ...lines]);
          }
        } catch (err) {
          setTerminalHistory(prev => [...prev, "Error: Failed to query audit registry."]);
        }
        break;
      case "system":
        setTerminalHistory(prev => [
          ...prev,
          "Ecosystem OS:  Next.js 16.2.6 & React 19.2.4",
          "Prisma Client: v7.8.0 (PostgreSQL)",
          "Nexus Engine:  v4.2.0-PRO",
          "Node Version:  v20.11.0",
          "Sector:        Sierra Leone US Data Center"
        ]);
        break;
      case "sync-alerts":
        setTerminalHistory(prev => [...prev, "Initiating automated scan checks..."]);
        try {
          const res = await runAutomatedSystemChecks();
          if (res.success) {
            setTerminalHistory(prev => [
              ...prev,
              `Success: Ecosystem scan completed.`,
              `  • Low Stock Alerts created: ${res.lowStockCount}`,
              `  • Expiring Batch alerts:     ${res.expiryCount}`,
              `  • Trial Expiry warnings sent: ${res.trialCount}`
            ]);
          } else {
            setTerminalHistory(prev => [...prev, `Error: Scan failed: ${res.error}`]);
          }
        } catch (err: any) {
          setTerminalHistory(prev => [...prev, `Error: ${err.message}`]);
        }
        break;
      case "system-update":
        const matches = rawInput.match(/system-update\s+"([^"]+)"\s+"([^"]+)"\s+(.+)/i);
        if (!matches) {
          setTerminalHistory(prev => [
            ...prev,
            'Error: Invalid format. Usage: system-update "version" "title" changelog messages...'
          ]);
        } else {
          const version = matches[1];
          const title = matches[2];
          const changelog = matches[3];
          setTerminalHistory(prev => [...prev, `Initiating software release broadcast: ${version}...`]);
          try {
            const res = await broadcastSystemUpdate(version, title, changelog);
            if (res.success) {
              setTerminalHistory(prev => [
                ...prev,
                `Success: System update broadcast completed.`,
                `  • Software version: ${version}`,
                `  • Devices targeted:  ${res.dispatchedCount}`
              ]);
            }
          } catch (err: any) {
            setTerminalHistory(prev => [...prev, `Error: Broadcast failed: ${err.message}`]);
          }
        }
        break;
      case "clear":
        setTerminalHistory([]);
        break;
      default:
        setTerminalHistory(prev => [
          ...prev,
          `Nexus CLI: command not found: '${primaryCmd}'. Type 'help' for manual.`
        ]);
    }
  }

  if (status === "loading" || !stats || !health || !settings) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-6 transition-colors duration-300">
         <div className="relative h-20 w-20 border-4 border-slate-200 dark:border-slate-900 border-t-indigo-500 rounded-full animate-spin">
            <div className="absolute inset-2 border-2 border-slate-200 dark:border-slate-900 border-t-blue-400 rounded-full animate-spin-slow" />
         </div>
         <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-[0.5em] animate-pulse">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 text-slate-900 dark:text-slate-200">
       <div className="max-w-7xl mx-auto space-y-12">
          {/* Global Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 relative z-10">
         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative h-12 w-12 md:h-16 md:w-16 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-900 shadow-lg rotate-3 flex-shrink-0 bg-white">
               <Image src="/images/logo2.jpeg" alt="Protech Logo" fill className="object-cover" />
            </div>
            <div className="space-y-1">
               <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-[1000] text-slate-900 dark:text-white tracking-tighter uppercase italic leading-tight">Nexus <span className="text-indigo-650 dark:text-indigo-500">Admin Panel</span></h1>
                  <div className="hidden sm:flex px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[7px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest h-fit">v4.2.0</div>
               </div>
               <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.25em]">Operational Level: Super Admin</p>
               </div>
            </div>
         </motion.div>
         
         <div className="flex items-center justify-center gap-4 mt-4 md:mt-0">
            <div className="flex flex-col items-center sm:items-end">
               <span className="text-[9px] font-black text-slate-500 dark:text-slate-550 tracking-widest leading-none uppercase">Admin User</span>
               <span className="text-xs font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tighter">Dr. Strange</span>
            </div>
            <Button variant="outline" onClick={async () => {
               const { logoutUserCompletely } = await import("@/lib/utils/logout");
               await logoutUserCompletely(signOut);
            }} className="h-10 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-500 hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">
               <LogOut className="mr-2 h-3.5 w-3.5" /> Log Out
            </Button>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl flex md:flex-wrap gap-2 mb-10 relative z-10 w-fit max-w-full overflow-x-auto scrollbar-none whitespace-nowrap">
        {[
          { id: "telemetry", label: "System Activity", icon: Activity },
          { id: "terminal", label: "Control Shell", icon: Terminal },
          { id: "backups", label: "Database Backups", icon: Database },
          { id: "operators", label: "User Monitor", icon: Users },
          { id: "settings", label: "System Settings", icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0",
                activeTab === tab.id 
                  ? "bg-white dark:bg-slate-950 text-indigo-655 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          {/* TELEMETRY TAB */}
          {activeTab === "telemetry" && (
            <div className="space-y-12">
              {/* Performance Metrics */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10">
                <StatCard title="Registered Stores" value={stats.businessCount} description="Active Stores" icon={Globe} delay={0.1} />
                <StatCard title="Total Users" value={stats.userCount} description="Active System Users" icon={Users} delay={0.2} />
                <StatCard title="Global Revenue" value={`Le ${stats.revenue.toLocaleString()}`} description="Platform-wide GMV" icon={BarChart3} delay={0.3} />
                <StatCard title="Pending Approvals" value={stats.pendingApprovals} description="Needs Attention" icon={AlertTriangle} delay={0.4} variant={stats.pendingApprovals > 0 ? "warning" : "default"} />
              </div>

              {inactiveBusinesses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] relative z-10 text-amber-800 dark:text-amber-300 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    <h3 className="font-black text-xs uppercase tracking-widest leading-none">Inactive Stores Warning (Registered &gt; 24h ago, 0 sales processed)</h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {inactiveBusinesses.map((biz) => (
                      <div key={biz.id} className="p-4 bg-white dark:bg-slate-900 border border-amber-500/10 dark:border-slate-800 rounded-xl space-y-1.5 text-xs text-slate-700 dark:text-slate-400">
                        <div className="font-black text-slate-900 dark:text-white flex justify-between items-center">
                          <span>{biz.name}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[9px] font-black uppercase text-amber-600 dark:text-amber-400">
                            {biz.productCount} Products
                          </span>
                        </div>
                        <div><span className="font-bold">Owner:</span> {biz.ownerName} ({biz.ownerEmail})</div>
                        {biz.phone && <div><span className="font-bold">Phone:</span> {biz.phone}</div>}
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                          Registered: {format(new Date(biz.createdAt), "MMM dd, yyyy HH:mm")}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Command Center & Heartbeat */}
              <div className="grid gap-8 lg:grid-cols-3 relative z-10">
                <div className="lg:col-span-2 space-y-8">
                  {/* Intelligence Hub */}
                  <GlassCard className="p-8 md:p-10">
                    <div className="flex items-center justify-between mb-8">
                       <div>
                          <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Intelligence Hub</h2>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Growth & Revenue Analytics</p>
                       </div>
                       <Button variant="ghost" size="icon" onClick={refreshData} className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                          <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
                       </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <div className="flex items-center gap-2">
                             <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-500" />
                             <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Store Acquisition Trend</span>
                          </div>
                          <NexusChart data={health.growth} dataKey="tenants" category="name" color="#6366f1" />
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-center gap-2">
                             <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                             <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Revenue Cycle Pulse</span>
                          </div>
                          <NexusChart data={health.revenue} dataKey="value" category="name" color="#10b981" />
                       </div>
                    </div>
                  </GlassCard>

                  {/* Commands */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <GlassCard className="p-8">
                       <div className="flex items-center gap-3 mb-6">
                          <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-500" />
                          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Broadcasting</h3>
                       </div>
                       
                       {/* Marquee Banner Section */}
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-555 dark:text-slate-400 uppercase tracking-widest leading-none">Global Marquee Banner (In-App)</p>
                          <Input 
                             placeholder="Enter global banner announcement..." 
                             value={broadcastMsg}
                             onChange={(e) => setBroadcastMsg(e.target.value)}
                             className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-12 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650"
                          />
                          <div className="flex gap-2">
                             <Button 
                                onClick={handleBroadcast}
                                disabled={!broadcastMsg.trim()}
                                className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-40"
                             >
                                <Send className="mr-2 h-4 w-4" /> Send Banner
                             </Button>
                             <Button 
                                onClick={handleClearBroadcast}
                                variant="outline"
                                className="h-12 px-4 rounded-xl border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest"
                             >
                                Clear
                             </Button>
                          </div>
                       </div>

                       <div className="h-px bg-slate-200 dark:bg-slate-800 my-6" />

                       {/* Push Notification Section */}
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-555 dark:text-slate-400 uppercase tracking-widest leading-none">Device Push Alert (Log-out/Offline safe)</p>
                          <Input 
                             placeholder="Notification Title (e.g., Critical Update)" 
                             value={pushTitle}
                             onChange={(e) => setPushTitle(e.target.value)}
                             className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-11 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650"
                          />
                          <Input 
                             placeholder="Notification Body Message..." 
                             value={pushBody}
                             onChange={(e) => setPushBody(e.target.value)}
                             className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-11 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650"
                          />
                          <Button 
                             onClick={handlePushBroadcast}
                             disabled={!pushTitle.trim() || !pushBody.trim() || sendingPush}
                             className="w-full h-12 rounded-xl bg-emerald-650 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-40 shadow-lg shadow-emerald-600/10"
                          >
                             {sendingPush ? "Transmitting..." : "Broadcast Device Push"}
                          </Button>
                       </div>

                       <div className="h-px bg-slate-200 dark:bg-slate-800 my-6" />

                       {/* System Software Update Section */}
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">Broadcast Software Update Alert</p>
                          <div className="flex gap-2">
                             <Input 
                                placeholder="Version (e.g., v4.3.0)" 
                                value={updateVersion}
                                onChange={(e) => setUpdateVersion(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-11 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650 flex-[2]"
                             />
                             <Input 
                                placeholder="Release Title" 
                                value={updateTitle}
                                onChange={(e) => setUpdateTitle(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-11 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650 flex-[3]"
                             />
                          </div>
                          <Input 
                             placeholder="Summary of changes & features deployed..." 
                             value={updateChangelog}
                             onChange={(e) => setUpdateChangelog(e.target.value)}
                             className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-11 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650"
                          />
                          <Button 
                             onClick={handleUpdateBroadcast}
                             disabled={!updateVersion.trim() || !updateTitle.trim() || !updateChangelog.trim() || sendingUpdate}
                             className="w-full h-12 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-40 shadow-lg shadow-indigo-600/10"
                          >
                             {sendingUpdate ? "Broadcasting Update..." : "Broadcast System Update Notification"}
                          </Button>
                       </div>
                    </GlassCard>

                    <GlassCard className="p-8">
                       <div className="flex items-center gap-3 mb-6">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Override</h3>
                       </div>
                       <div className="space-y-6">
                          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                             <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Maintenance Mode</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Disable non-admin access</p>
                             </div>
                             <Switch 
                                checked={isMaintenance} 
                                onCheckedChange={handleMaintenance}
                                className="data-[state=checked]:bg-rose-500" 
                             />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                              <div className="space-y-0.5">
                                 <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Diagnostic Level</p>
                                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Verbose core telemetry</p>
                              </div>
                              <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-2 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20">Alpha-7</div>
                           </div>
                           <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
                           <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-555 dark:text-slate-400 uppercase tracking-widest leading-none">Automated Scans</p>
                              <Button 
                                 onClick={handleRunAutomatedChecks}
                                 disabled={syncingAlerts}
                                 className="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest"
                              >
                                 {syncingAlerts ? "Scanning Ecosystem..." : "Run Ecosystem Alerts Scan"}
                              </Button>
                           </div>          
                       </div>
                    </GlassCard>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* System Heartbeat */}
                  <GlassCard className="p-8">
                     <div className="flex items-center gap-3 mb-8">
                        <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-500" />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Nexus Heartbeat</h3>
                     </div>
                     <div className="space-y-4">
                        {[
                           { label: "API Gateway", status: "Operational", color: "text-emerald-500", load: `${telemetryLoads.apiGateway}%` },
                           { label: "Core Database", status: "Healthy", color: "text-emerald-500", load: `${telemetryLoads.coreDatabase}%` },
                           { label: "Worker Cluster", status: "Optimizing", color: "text-indigo-400", load: `${telemetryLoads.workerCluster}%` },
                           { label: "Storage Engine", status: "Operational", color: "text-emerald-500", load: `0${telemetryLoads.storageEngine}%`.slice(-3) },
                           { label: "CDN Network", status: "Operational", color: "text-emerald-500", load: `${telemetryLoads.cdnNetwork}%` }
                        ].map((item, i) => (
                           <div key={i} className="group p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.label}</span>
                                 <span className={cn("text-[9px] font-black uppercase italic", item.color)}>{item.status}</span>
                              </div>
                              <div className="h-1 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: item.load }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className={cn("h-full", item.color.replace('text-', 'bg-'))} 
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  </GlassCard>

                  {/* Database Performance Diagnostics */}
                  <GlassCard className="p-8">
                     <div className="flex items-center gap-3 mb-8">
                        <Database className="h-5 w-5 text-indigo-650 dark:text-indigo-500" />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Database Diagnostics</h3>
                     </div>
                     <div className="space-y-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                           <span className="uppercase tracking-widest text-[9px]">Ecosystem DB Size</span>
                           <span className="text-slate-900 dark:text-white font-black text-sm">4.82 MB</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                           <span className="uppercase tracking-widest text-[9px]">Active Connection Pool</span>
                           <span className="text-slate-900 dark:text-white font-black text-sm">8 / 20 connections</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                           <span className="uppercase tracking-widest text-[9px]">Query Response Latency</span>
                           <span className="text-emerald-500 font-black text-sm">14 ms (Avg)</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                           <span className="uppercase tracking-widest text-[9px]">Cache Hit Ratio</span>
                           <span className="text-indigo-500 font-black text-sm">99.85%</span>
                        </div>
                     </div>
                  </GlassCard>

                  {/* Quick Links */}
                  <div className="space-y-4">
                    <Link href="/super-admin/approvals">
                       <GlassCard className={cn(
                          "p-6 group transition-all duration-300",
                          stats.pendingApprovals > 0 
                            ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500 hover:border-amber-500" 
                            : "hover:bg-slate-900 dark:hover:bg-indigo-950/40 hover:border-slate-700 dark:hover:border-indigo-500/30"
                       )}>
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className={cn(
                                   "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                   stats.pendingApprovals > 0 
                                     ? "bg-amber-500/20 text-amber-600 group-hover:bg-white/20 group-hover:text-white" 
                                     : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-500 group-hover:bg-slate-800 dark:group-hover:bg-white/20 group-hover:text-white dark:group-hover:text-white"
                                )}>
                                   <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-white transition-colors duration-300 uppercase tracking-tight">Pending Approvals</p>
                                   <p className="text-[9px] font-bold text-slate-500 group-hover:text-indigo-100 dark:group-hover:text-indigo-200 transition-colors duration-300 uppercase tracking-widest">{stats.pendingApprovals} stores awaiting approval</p>
                                </div>
                             </div>
                             <Terminal className="h-4 w-4 text-slate-400 dark:text-slate-700 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                       </GlassCard>
                    </Link>
                    <Link href="/super-admin/businesses">
                       <GlassCard className="p-6 group hover:bg-slate-900 dark:hover:bg-indigo-950/40 hover:border-slate-700 dark:hover:border-indigo-500/30 transition-all duration-300">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/10 group-hover:bg-slate-800 dark:group-hover:bg-white/20 flex items-center justify-center text-indigo-600 dark:text-indigo-500 group-hover:text-white dark:group-hover:text-white transition-colors">
                                   <Globe className="h-5 w-5" />
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-white dark:group-hover:text-indigo-200 transition-colors duration-300 uppercase tracking-tight">Store Registry</p>
                                   <p className="text-[9px] font-bold text-slate-500 group-hover:text-indigo-100 dark:group-hover:text-indigo-300/80 transition-colors duration-300 uppercase tracking-widest">Manage Registered Stores</p>
                                </div>
                             </div>
                             <Terminal className="h-4 w-4 text-slate-400 dark:text-slate-700 group-hover:text-white dark:group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                       </GlassCard>
                    </Link>
                    <Link href="/super-admin/logs">
                       <GlassCard className="p-6 group hover:bg-slate-900 dark:hover:bg-slate-900/60 hover:border-slate-700 transition-all duration-300">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                                   <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-white transition-colors duration-300 uppercase tracking-tight">Security Logs</p>
                                   <p className="text-[9px] font-bold text-slate-500 group-hover:text-slate-200 dark:group-hover:text-slate-300 transition-colors duration-300 uppercase tracking-widest">System Audit Logs</p>
                                </div>
                             </div>
                             <Terminal className="h-4 w-4 text-slate-400 dark:text-slate-700 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                       </GlassCard>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NEXUS CLI TERMINAL TAB */}
          {activeTab === "terminal" && (
            <GlassCard className="p-8 font-mono">
              <div className="flex items-center gap-3 mb-6">
                 <Terminal className="h-5 w-5 text-indigo-600 dark:text-indigo-500" />
                 <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Nexus Interactive CLI</h2>
              </div>
              
              <div className="bg-black border border-slate-900 rounded-2xl p-6 min-h-[400px] max-h-[500px] overflow-y-auto flex flex-col justify-between shadow-inner custom-scrollbar relative">
                 <div className="space-y-2 text-xs text-emerald-400 select-text">
                    {terminalHistory.map((line, i) => (
                       <div key={i} className={cn(
                          "whitespace-pre-wrap leading-relaxed",
                          line.startsWith("> ") ? "text-indigo-400 font-bold" : 
                          line.startsWith("Error:") ? "text-rose-500 font-bold" :
                          line.startsWith("Success:") ? "text-emerald-500 font-bold" : "text-emerald-450"
                       )}>
                          {line}
                       </div>
                    ))}
                 </div>
                 
                 <form onSubmit={handleTerminalSubmit} className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-900/65">
                    <span className="text-indigo-500 font-bold text-sm select-none">&gt;</span>
                    <input 
                       type="text"
                       value={terminalInput}
                       onChange={(e) => setTerminalInput(e.target.value)}
                       className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-white font-bold text-sm caret-indigo-500"
                       placeholder="Type command here..."
                       autoFocus
                    />
                 </form>
              </div>
            </GlassCard>
          )}

          {/* DATABASE BACKUPS TAB */}
          {activeTab === "backups" && (
            <GlassCard className="p-8">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                  <div>
                     <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Database Backups</h2>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Database Backups</p>
                  </div>
                  <div>
                     <Button 
                        onClick={async () => {
                           try {
                              toast.loading("Generating database snapshot...");
                              const res = await generateBackup();
                              if (res.success) {
                                 toast.dismiss();
                                 toast.success(`Snapshot ${res.filename} generated successfully.`);
                                 refreshData();
                              }
                           } catch (err: any) {
                              toast.dismiss();
                              toast.error(err.message || "Failed to generate snapshot.");
                           }
                        }}
                        className="h-12 px-6 bg-indigo-650 hover:bg-indigo-755 dark:hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                     >
                        <Database className="mr-2 h-4 w-4" /> Create Snapshot
                     </Button>
                  </div>
               </div>

               <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-100/10 dark:bg-slate-950/20">
                  <Table className="min-w-[600px]">
                     <TableHeader className="bg-slate-100/50 dark:bg-slate-900/30">
                        <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                           <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-14 pl-6">Backup Filename</TableHead>
                           <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-14">Timestamp</TableHead>
                           <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-14">File Size</TableHead>
                           <TableHead className="w-[120px] text-right pr-6 h-14"></TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {backups.length === 0 ? (
                           <TableRow>
                              <TableCell colSpan={4} className="h-48 text-center">
                                 <div className="flex flex-col items-center gap-4">
                                    <Database className="h-12 w-12 text-slate-350 dark:text-slate-700 animate-pulse" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">No database backups available.</p>
                                 </div>
                              </TableCell>
                           </TableRow>
                        ) : (
                           backups.map((b) => (
                              <TableRow key={b.filename} className="hover:bg-slate-100/50 dark:hover:bg-white/5 border-slate-200 dark:border-slate-900 transition-all">
                                 <TableCell className="font-bold text-slate-900 dark:text-white text-sm pl-6 py-4">{b.filename}</TableCell>
                                 <TableCell className="text-slate-500 dark:text-slate-400 text-xs">{format(new Date(b.createdAt), "dd MMM yyyy HH:mm:ss")}</TableCell>
                                 <TableCell className="text-slate-500 dark:text-slate-400 text-xs">{(b.sizeBytes / 1024).toFixed(2)} KB</TableCell>
                                 <TableCell className="pr-6 text-right">
                                    <div className="flex justify-end gap-2">
                                       <a 
                                          href={`/api/super-admin/backups/${b.filename}`}
                                          className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-600/20 text-indigo-600 dark:text-indigo-500 flex items-center justify-center hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors"
                                          title="Download snapshot"
                                       >
                                          <Download className="h-4 w-4" />
                                       </a>
                                       <Button 
                                          onClick={async () => {
                                             if (window.confirm("CRITICAL: Permanently delete this snapshot file?")) {
                                                try {
                                                   await deleteBackupFile(b.filename);
                                                   toast.success("Snapshot deleted.");
                                                   refreshData();
                                                } catch (err: any) {
                                                   toast.error("Failed to delete snapshot.");
                                                }
                                             }
                                          }}
                                          variant="ghost"
                                          className="h-9 w-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-500 flex items-center justify-center hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white p-0 transition-all"
                                          title="Delete snapshot"
                                       >
                                          <Trash2 className="h-4 w-4" />
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
          )}

          {/* USER DIRECTORY TAB */}
          {activeTab === "operators" && (
             <div className="space-y-8">
                <GlassCard className="p-8">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                      <div>
                         <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">User Directory</h2>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active System Users and Roles</p>
                      </div>
                      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                         <div className="flex items-center gap-3">
                            <Button
                               onClick={() => setIsAddSuperAdminOpen(true)}
                               className="flex-1 md:flex-none h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-black text-white uppercase tracking-widest gap-2 px-4 flex items-center justify-center shadow-lg shadow-rose-600/10 active:scale-95 transition-all"
                            >
                               <Shield className="h-3.5 w-3.5" />
                               Add Super Admin
                            </Button>
                            <Button
                               onClick={async () => {
                                 try {
                                   setRefreshingUsers(true);
                                   const u = await getAllSystemUsers();
                                   setSystemUsers(u);
                                   toast.success("User list refreshed.");
                                 } catch {
                                   toast.error("Failed to sync user list.");
                                 } finally {
                                   setRefreshingUsers(false);
                                 }
                               }}
                               disabled={refreshingUsers}
                               variant="outline"
                               className="flex-1 md:flex-none h-10 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 gap-2 px-4 flex items-center justify-center"
                            >
                               <RefreshCw className={cn("h-3.5 w-3.5", refreshingUsers && "animate-spin")} />
                               Refresh
                            </Button>
                         </div>
                         <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                               placeholder="Search users..." 
                               value={userSearchQuery}
                               onChange={(e) => setUserSearchQuery(e.target.value)}
                               className="pl-9 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-10 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-indigo-500/20 w-full"
                            />
                         </div>
                      </div>
                   </div>

                   <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-100/10 dark:bg-slate-950/20">
                      <Table className="min-w-[800px]">
                         <TableHeader className="bg-slate-100/50 dark:bg-slate-900/30">
                            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                               <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-14 pl-10">User</TableHead>
                               <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-14">Store Name</TableHead>
                               <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-14">Role</TableHead>
                               <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-14">Last Active & Logged Action</TableHead>
                               <TableHead className="font-black text-slate-500 uppercase text-[10px] tracking-widest h-14">Status</TableHead>
                               <TableHead className="w-[150px] text-right pr-10 h-14"></TableHead>
                            </TableRow>
                         </TableHeader>
                         <TableBody>
                            {systemUsers.filter(u => 
                               u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                               u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                               u.role.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                               u.business.toLowerCase().includes(userSearchQuery.toLowerCase())
                            ).length === 0 ? (
                               <TableRow>
                                  <TableCell colSpan={6} className="h-48 text-center">
                                     <div className="flex flex-col items-center gap-4">
                                        <Users className="h-12 w-12 text-slate-350 dark:text-slate-700 animate-pulse" />
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">No users matching query.</p>
                                     </div>
                                  </TableCell>
                               </TableRow>
                            ) : (
                               systemUsers
                                 .filter(u => 
                                   u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                   u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                   u.role.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                   u.business.toLowerCase().includes(userSearchQuery.toLowerCase())
                                 )
                                 .map((u) => {
                                   const isSelf = u.id === session?.user?.id;
                                   return (
                                     <TableRow key={u.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 border-slate-200 dark:border-slate-900 group transition-all">
                                       <TableCell className="pl-10 py-5">
                                         <div className="flex items-center gap-4">
                                           <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-black text-base shadow-sm">
                                             {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                                           </div>
                                           <div className="flex flex-col">
                                             <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-2">
                                                {u.name || "Unnamed User"}
                                                {isSelf && <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider border border-emerald-500/20">YOU</span>}
                                             </span>
                                             <span className="text-[9px] font-medium text-slate-400">{u.email}</span>
                                           </div>
                                         </div>
                                       </TableCell>
                                       <TableCell className="font-bold text-slate-700 dark:text-slate-300 text-xs">{u.business}</TableCell>
                                       <TableCell>
                                         <span className={cn(
                                           "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                           u.role === 'SUPERADMIN' ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" :
                                           u.role === 'ADMIN' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-650 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-400"
                                         )}>
                                           {u.role}
                                         </span>
                                       </TableCell>
                                       <TableCell>
                                         {u.lastActiveAt ? (
                                           <div className="flex flex-col">
                                              <span className="text-xs font-bold text-slate-800 dark:text-slate-300">{u.lastAction}</span>
                                              <span className="text-[9px] text-slate-400">{format(new Date(u.lastActiveAt), "dd MMM yyyy HH:mm")}</span>
                                           </div>
                                         ) : (
                                           <span className="text-xs text-slate-400 italic">No activity logged</span>
                                         )}
                                       </TableCell>
                                       <TableCell>
                                         <div className="flex items-center gap-3">
                                           <Switch 
                                              checked={u.status === 'active'}
                                              disabled={isSelf}
                                              onCheckedChange={() => handleToggleUserStatus(u.id, u.status)}
                                              className="data-[state=checked]:bg-emerald-500"
                                           />
                                           <span className={cn(
                                             "text-[9px] font-black uppercase tracking-widest italic",
                                             u.status === 'active' ? "text-emerald-500" : "text-amber-500"
                                           )}>{u.status}</span>
                                         </div>
                                       </TableCell>
                                       <TableCell className="pr-10 text-right">
                                          <Button 
                                             variant="outline"
                                             size="sm"
                                             disabled={isSelf}
                                             onClick={() => setSelectedUserForPasswordReset(u)}
                                             className="h-8 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                                          >
                                             Override Key
                                          </Button>
                                       </TableCell>
                                     </TableRow>
                                   );
                                 })
                            )}
                         </TableBody>
                      </Table>
                   </div>
                </GlassCard>

                {/* Password Override Modal */}
                <AnimatePresence>
                   {selectedUserForPasswordReset && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                         <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md overflow-hidden bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6"
                         >
                            <div className="flex items-center justify-between">
                               <div className="space-y-1">
                                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Override Password</h3>
                                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">User: {selectedUserForPasswordReset.name || selectedUserForPasswordReset.email}</p>
                               </div>
                            </div>
                            
                            <form onSubmit={handleOverrideUserPassword} className="space-y-4">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Password</label>
                                  <Input 
                                     type="password"
                                     placeholder="••••••••"
                                     value={overridePasswordVal}
                                     onChange={(e) => setOverridePasswordVal(e.target.value)}
                                     required
                                     className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl h-12 text-sm font-bold text-slate-900 dark:text-white"
                                  />
                               </div>
                               <div className="flex gap-4 pt-2">
                                  <Button 
                                     type="button"
                                     variant="outline"
                                     onClick={() => {
                                        setSelectedUserForPasswordReset(null);
                                        setOverridePasswordVal("");
                                     }}
                                     className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400"
                                  >
                                     Cancel
                                  </Button>
                                  <Button 
                                     type="submit"
                                     disabled={isResettingPassword}
                                     className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                                  >
                                     {isResettingPassword ? "Applying..." : "Confirm Override"}
                                  </Button>
                                </div>
                            </form>
                         </motion.div>
                      </div>
                   )}
                </AnimatePresence>

                {/* Add Super Admin Modal */}
                <AnimatePresence>
                   {isAddSuperAdminOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                         <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6"
                         >
                            <div>
                               <h3 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2">
                                  <Shield className="h-5 w-5 text-rose-600" />
                                  Add New <span className="text-rose-600">Super Admin</span>
                               </h3>
                               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Register a new user with full system administrative privileges.</p>
                            </div>
                            
                            <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                                  <Input 
                                     placeholder="e.g. Dr. Strange"
                                     value={newSuperAdminName}
                                     onChange={(e) => setNewSuperAdminName(e.target.value)}
                                     required
                                     className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-11 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                  />
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Username (Optional)</label>
                                  <Input 
                                     placeholder="e.g. strange_admin"
                                     value={newSuperAdminUsername}
                                     onChange={(e) => setNewSuperAdminUsername(e.target.value)}
                                     className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-11 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                  />
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                                  <Input 
                                     type="email"
                                     placeholder="e.g. strange@protech.com"
                                     value={newSuperAdminEmail}
                                     onChange={(e) => setNewSuperAdminEmail(e.target.value)}
                                     required
                                     className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-11 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                  />
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                                  <Input 
                                     type="password"
                                     placeholder="••••••••"
                                     value={newSuperAdminPassword}
                                     onChange={(e) => setNewSuperAdminPassword(e.target.value)}
                                     required
                                     className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-11 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                  />
                               </div>
                               <div className="flex gap-4 pt-2">
                                  <Button 
                                     type="button"
                                     variant="outline"
                                     onClick={() => {
                                        setIsAddSuperAdminOpen(false);
                                        setNewSuperAdminName("");
                                        setNewSuperAdminUsername("");
                                        setNewSuperAdminEmail("");
                                        setNewSuperAdminPassword("");
                                     }}
                                     className="flex-1 h-11 rounded-xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400"
                                  >
                                     Cancel
                                  </Button>
                                  <Button 
                                     type="submit"
                                     disabled={isCreatingSuperAdmin}
                                     className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-600/20"
                                  >
                                     {isCreatingSuperAdmin ? "Registering..." : "Create Admin"}
                                  </Button>
                               </div>
                            </form>
                         </motion.div>
                      </div>
                   )}
                </AnimatePresence>
             </div>
          )}

          {/* SYSTEM SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-8">
             <GlassCard className="p-8 space-y-8">
                <div>
                   <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">System Settings</h2>
                   <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Global platform configuration</p>
                </div>

                <div className="grid gap-6">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                      <div className="space-y-1">
                         <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Registration Settings</p>
                         <p className="text-xs text-slate-500 font-medium max-w-xl">Toggle whether new stores are allowed to register. When disabled, the registration page will show an invite-only card.</p>
                      </div>
                      <Switch 
                         checked={settings?.registrationOpen ?? true} 
                         onCheckedChange={(val: boolean) => handleSettingUpdate("registrationOpen", val)}
                         className="data-[state=checked]:bg-indigo-500 flex-shrink-0"
                      />
                   </div>

                   <div className="flex flex-col gap-4 p-6 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="space-y-1">
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Default Trial Duration</p>
                            <p className="text-xs text-slate-500 font-medium">Set the default number of trial days for newly registered stores.</p>
                         </div>
                         <div className="text-xs font-black text-indigo-650 dark:text-indigo-400 px-3 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20 uppercase tracking-widest w-fit">{settings?.defaultTrialDays ?? 7} Days</div>
                      </div>
                      <input 
                         type="range"
                         min={3}
                         max={30}
                         value={settings?.defaultTrialDays ?? 7}
                         onChange={(e) => handleSettingUpdate("defaultTrialDays", parseInt(e.target.value))}
                         className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                   </div>

                   <div className="flex flex-col gap-4 p-6 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                      <div className="space-y-1">
                         <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Global Broadcast Announcement</p>
                         <p className="text-xs text-slate-500 font-medium">Create a floating marquee notification banner shown across all tenant dashboards (leave empty to clear).</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                         <Input 
                            placeholder="e.g. Platform undergoing maintenance on June 24 at 02:00 UTC."
                            value={settings?.announcementBanner ?? ""}
                            onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
                            className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-12 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:ring-indigo-500/20"
                         />
                         <Button 
                            onClick={() => handleSettingUpdate("announcementBanner", settings.announcementBanner)}
                            className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex-shrink-0"
                         >
                            Save Banner
                         </Button>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                      <div className="space-y-1">
                         <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">System Mail Agent</p>
                         <p className="text-xs text-slate-500 font-medium max-w-xl">Enable or disable automated system notifications, invoice mailings, and critical email alerts.</p>
                      </div>
                      <Switch 
                         checked={settings?.emailAlertsEnabled ?? true} 
                         onCheckedChange={(val: boolean) => handleSettingUpdate("emailAlertsEnabled", val)}
                         className="data-[state=checked]:bg-indigo-500 flex-shrink-0"
                      />
                   </div>
                </div>
             </GlassCard>

             {/* SaaS Voucher Activation Key Generator */}
             <GlassCard className="p-8 space-y-6">
                <div>
                   <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Voucher & License Generator</h2>
                   <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Create promotion keys & trial vouchers</p>
                </div>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Activation Tier</label>
                        <select 
                           value={voucherTier}
                           onChange={(e) => setVoucherTier(e.target.value)}
                           className="h-11 w-full px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
                        >
                           <option value="SHOP">Shop Tier (Standard)</option>
                           <option value="PRO">Pro Tier (Professional)</option>
                           <option value="ENTERPRISE">Enterprise Tier (Premium)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Voucher Validity (Days)</label>
                        <Input 
                           type="number"
                           value={voucherDays}
                           onChange={(e) => setVoucherDays(parseInt(e.target.value) || 30)}
                           className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl h-11 text-xs font-bold text-slate-900 dark:text-white"
                        />
                     </div>
                     <div className="space-y-2 flex items-end">
                        <Button 
                           onClick={handleGenerateVoucher}
                           className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/10"
                        >
                           Generate Code
                        </Button>
                     </div>
                  </div>

                  {generatedVoucher && (
                     <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-indigo-150 dark:border-indigo-900/40 flex justify-between items-center">
                        <div>
                           <p className="text-[8px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">VOUCHER DEPLOYED</p>
                           <p className="text-sm font-black text-slate-900 dark:text-white font-mono mt-1">{generatedVoucher.code}</p>
                           <p className="text-[9px] font-bold text-slate-500 mt-0.5">{generatedVoucher.days} Days - {generatedVoucher.tier} Access Key</p>
                        </div>
                        <Button 
                           size="sm" 
                           variant="outline" 
                           className="h-10 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2"
                           onClick={() => {
                              navigator.clipboard.writeText(generatedVoucher.code);
                              toast.success("Voucher code copied to clipboard!");
                           }}
                        >
                           Copy Code
                        </Button>
                     </div>
                  )}
                </div>
             </GlassCard>

             <GlassCard className="p-8 space-y-6">
                <div>
                   <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Super Admin Credentials</h2>
                   <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Secure system override key</p>
                </div>

                <form onSubmit={handleOwnPasswordUpdate} className="space-y-4 max-w-lg">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Password</label>
                      <Input 
                         type="password"
                         placeholder="••••••••"
                         value={currentOwnPassword}
                         onChange={(e) => setCurrentOwnPassword(e.target.value)}
                         className="bg-slate-50 dark:bg-slate-955/50 border-slate-200 dark:border-slate-800 rounded-xl h-12 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                      />
                   </div>
                   <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Password</label>
                         <Input 
                            type="password"
                            placeholder="••••••••"
                            value={newOwnPassword}
                            onChange={(e) => setNewOwnPassword(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-955/50 border-slate-200 dark:border-slate-800 rounded-xl h-12 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm New Password</label>
                         <Input 
                            type="password"
                            placeholder="••••••••"
                            value={confirmOwnPassword}
                            onChange={(e) => setConfirmOwnPassword(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-955/50 border-slate-200 dark:border-slate-800 rounded-xl h-12 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                         />
                      </div>
                   </div>
                   <Button 
                      type="submit" 
                      disabled={updatingOwnPassword}
                      className="h-12 px-6 bg-indigo-650 hover:bg-indigo-755 dark:hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                   >
                      {updatingOwnPassword ? "Updating Key..." : "Update Admin Key"}
                   </Button>
                </form>
             </GlassCard>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
       </div>
    </div>
  );
}
