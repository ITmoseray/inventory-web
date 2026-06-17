"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, Globe, Zap, Database, Server, Terminal, 
  LogOut, Activity, MessageSquare, AlertTriangle, Cpu,
  BarChart3, Users, Briefcase, RefreshCw, Send
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  getSystemStats, 
  getEcosystemHealth, 
  globalBroadcast, 
  toggleMaintenanceMode 
} from "@/lib/actions/super-admin";
import { GlassCard } from "@/components/super-admin/glass-card";
import { NexusChart } from "@/components/super-admin/nexus-chart";
import { StatCard } from "@/components/super-admin/stat-card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function NexusSuperControl() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      refreshData();
    }
  }, [status, router]);

  async function refreshData() {
    try {
      setLoading(true);
      const [statsData, healthData] = await Promise.all([
        getSystemStats(),
        getEcosystemHealth()
      ]);
      setStats(statsData);
      setHealth(healthData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync with Nexus core.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBroadcast() {
    if (!broadcastMsg) return;
    try {
      await globalBroadcast(broadcastMsg);
      toast.success("Ecosystem-wide broadcast transmitted.");
      setBroadcastMsg("");
    } catch (error) {
      toast.error("Transmission failed.");
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

  if (status === "loading" || !stats || !health) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
         <div className="relative h-20 w-20 border-4 border-slate-900 border-t-indigo-500 rounded-full animate-spin">
            <div className="absolute inset-2 border-2 border-slate-900 border-t-blue-400 rounded-full animate-spin-slow" />
         </div>
         <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] animate-pulse">Initializing Nexus Super Control...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 text-slate-200">
      {/* Global Header */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-8 mb-16 relative z-10">
         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-4 border-slate-900 shadow-2xl shadow-indigo-500/20 rotate-3 flex-shrink-0">
               <Image src="/images/logo2.jpeg" alt="Protech Logo" fill className="object-cover" />
            </div>
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-[1000] text-white tracking-tighter uppercase italic leading-tight">Nexus <span className="text-indigo-500">Super Control</span></h1>
                  <div className="hidden sm:flex px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase tracking-widest h-fit">v4.2.0-PRO</div>
               </div>
               <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Operational Level: Administrator Zero</p>
               </div>
            </div>
         </motion.div>
         
         <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex flex-col items-end mr-4">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Commanding</span>
               <span className="text-sm font-black text-white mt-1 uppercase tracking-tighter">Dr. Strange</span>
            </div>
            <Button onClick={() => signOut()} className="h-14 px-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white font-black text-xs uppercase tracking-widest transition-all">
               <LogOut className="mr-3 h-4 w-4" /> Terminate Node
            </Button>
         </div>
      </div>

      {/* Performance Matrix */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12 relative z-10">
        <StatCard title="Ecosystem Nodes" value={stats.businessCount} description="Operational Tenants" icon={Globe} delay={0.1} />
        <StatCard title="Total Operators" value={stats.userCount} description="Active System Users" icon={Users} delay={0.2} />
        <StatCard title="Global Revenue" value={`Le ${stats.revenue.toLocaleString()}`} description="Platform-wide GMV" icon={BarChart3} delay={0.3} />
        <StatCard title="Pending Approvals" value={stats.pendingApprovals} description="Needs Attention" icon={AlertTriangle} delay={0.4} variant="warning" />
      </div>

      {/* Main Command Grid */}
      <div className="grid gap-8 lg:grid-cols-3 relative z-10">
        
        {/* Column 1 & 2: Intelligence & Operations */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Intelligence Hub */}
           <GlassCard className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-2xl font-[1000] text-white uppercase tracking-tighter italic">Intelligence Hub</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Growth & Revenue Analytics</p>
                 </div>
                 <Button variant="ghost" size="icon" onClick={refreshData} className="rounded-xl hover:bg-white/5 text-slate-500 hover:text-indigo-400">
                    <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
                 </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Briefcase className="h-4 w-4 text-indigo-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenant Acquisition Trend</span>
                    </div>
                    <NexusChart data={health.growth} dataKey="tenants" category="name" color="#6366f1" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Activity className="h-4 w-4 text-emerald-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Cycle Pulse</span>
                    </div>
                    <NexusChart data={health.revenue} dataKey="value" category="name" color="#10b981" />
                 </div>
              </div>
           </GlassCard>

           {/* Command Center */}
           <div className="grid md:grid-cols-2 gap-8">
              <GlassCard className="p-8">
                 <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">Global Broadcast</h3>
                 </div>
                 <div className="space-y-4">
                    <Input 
                       placeholder="Enter global system notification..." 
                       value={broadcastMsg}
                       onChange={(e) => setBroadcastMsg(e.target.value)}
                       className="bg-slate-950/50 border-slate-800 rounded-xl h-12 text-sm font-bold text-white placeholder:text-slate-600 focus:ring-indigo-500/20"
                    />
                    <Button 
                       onClick={handleBroadcast}
                       className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                    >
                       <Send className="mr-2 h-4 w-4" /> Transmit Signal
                    </Button>
                 </div>
              </GlassCard>

              <GlassCard className="p-8">
                 <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">System Override</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                       <div className="space-y-0.5">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Maintenance Mode</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Disable non-admin access</p>
                       </div>
                       <Switch 
                          checked={isMaintenance} 
                          onCheckedChange={handleMaintenance}
                          className="data-[state=checked]:bg-rose-500" 
                       />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                       <div className="space-y-0.5">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Diagnostic Level</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Verbose core telemetry</p>
                       </div>
                       <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20">Alpha-7</div>
                    </div>
                 </div>
              </GlassCard>
           </div>
        </div>

        {/* Column 3: System Heartbeat & Quick Access */}
        <div className="space-y-8">
           
           {/* System Heartbeat */}
           <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-8">
                 <Cpu className="h-5 w-5 text-indigo-500" />
                 <h3 className="text-lg font-black text-white uppercase tracking-tighter">Nexus Heartbeat</h3>
              </div>
              <div className="space-y-4">
                 {[
                    { label: "API Gateway", status: "Operational", color: "text-emerald-500", load: "12%" },
                    { label: "Core Database", status: "Healthy", color: "text-emerald-500", load: "34%" },
                    { label: "Worker Cluster", status: "Optimizing", color: "text-indigo-400", load: "88%" },
                    { label: "Storage Engine", status: "Operational", color: "text-emerald-500", load: "05%" },
                    { label: "CDN Network", status: "Operational", color: "text-emerald-500", load: "21%" }
                 ].map((item, i) => (
                    <div key={i} className="group p-4 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                          <span className={cn("text-[9px] font-black uppercase italic", item.color)}>{item.status}</span>
                       </div>
                       <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
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

           {/* Quick Nodes */}
           <div className="space-y-4">
              <Link href="/super-admin/approvals">
                 <GlassCard className={cn(
                    "p-6 group transition-all duration-300",
                    stats.pendingApprovals > 0 ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500 hover:border-amber-500" : "hover:bg-indigo-600"
                 )}>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                             "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                             stats.pendingApprovals > 0 ? "bg-amber-500/20 text-amber-500 group-hover:bg-white/20 group-hover:text-white" : "bg-indigo-500/10 text-indigo-500 group-hover:bg-white/20 group-hover:text-white"
                          )}>
                             <AlertTriangle className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-white uppercase tracking-tight">Pending Approvals</p>
                             <p className="text-[9px] font-bold text-slate-500 group-hover:text-white uppercase tracking-widest">{stats.pendingApprovals} nodes awaiting action</p>
                          </div>
                       </div>
                       <Terminal className="h-4 w-4 text-slate-700 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                 </GlassCard>
              </Link>
              <Link href="/super-admin/businesses">
                 <GlassCard className="p-6 group hover:bg-indigo-600 transition-all duration-300">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 group-hover:bg-white/20 flex items-center justify-center text-indigo-500 group-hover:text-white transition-colors">
                             <Globe className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-white uppercase tracking-tight">Tenant Vault</p>
                             <p className="text-[9px] font-bold text-slate-500 group-hover:text-indigo-100 uppercase tracking-widest">Ecosystem Registry</p>
                          </div>
                       </div>
                       <Terminal className="h-4 w-4 text-slate-700 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                 </GlassCard>
              </Link>
              <Link href="/super-admin/logs">
                 <GlassCard className="p-6 group hover:bg-slate-900 transition-all duration-300">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-500 transition-colors">
                             <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-white uppercase tracking-tight">Security Node</p>
                             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ecosystem Audit</p>
                          </div>
                       </div>
                       <Terminal className="h-4 w-4 text-slate-700 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                 </GlassCard>
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
