"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, FileText, Search, ArrowRight, UserCheck, ShieldCheck, 
  Phone, Mail, TrendingUp, TrendingDown, Minus,
  ShoppingBag, AlertTriangle, CheckCircle2, Clock, ChevronDown, X, BarChart3
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, getIndustryColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { getRegistryIntelligence } from "@/lib/actions/registry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

type ProfileNode = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  totalVolume: number;
  lastInteraction: string;
  daysSinceLastPurchase: number;
  primaryAffinity: string;
  status: "High Velocity" | "Dormant" | "At Risk";
  totalOrders: number;
};

const STATUS_CONFIG = {
  "High Velocity": { color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: TrendingUp },
  "Dormant":       { color: "bg-slate-300",   text: "text-slate-500 dark:text-slate-400",   bg: "bg-slate-50 dark:bg-slate-800/50",      icon: Minus },
  "At Risk":       { color: "bg-rose-500",     text: "text-rose-600 dark:text-rose-400",     bg: "bg-rose-50 dark:bg-rose-500/10",        icon: TrendingDown },
};

const SORT_OPTIONS = [
  { val: "volume_desc", label: "Highest Spend" },
  { val: "volume_asc",  label: "Lowest Spend" },
  { val: "recent",      label: "Most Recent" },
  { val: "orders",      label: "Most Orders" },
];

export default function PurchaseProfilesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const businessType = session?.user?.businessType || "SHOP";
  const colors = getIndustryColor(businessType);

  const [data, setData] = useState<{ nodes: ProfileNode[]; clusterCounts: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [clusterFilter, setClusterFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("volume_desc");
  const [selectedProfile, setSelectedProfile] = useState<ProfileNode | null>(null);

  function loadData() {
    setLoading(true);
    getRegistryIntelligence()
      .then(d => setData(d as any))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  const filteredNodes = useMemo(() => {
    if (!data?.nodes) return [];
    let nodes = [...data.nodes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      nodes = nodes.filter(n =>
        n.name.toLowerCase().includes(q) ||
        n.primaryAffinity.toLowerCase().includes(q) ||
        (n.phone && n.phone.includes(q)) ||
        (n.email && n.email.toLowerCase().includes(q))
      );
    }
    if (clusterFilter) nodes = nodes.filter(n => n.status === clusterFilter);
    switch (sortBy) {
      case "volume_desc": nodes.sort((a, b) => b.totalVolume - a.totalVolume); break;
      case "volume_asc":  nodes.sort((a, b) => a.totalVolume - b.totalVolume); break;
      case "recent":      nodes.sort((a, b) => a.daysSinceLastPurchase - b.daysSinceLastPurchase); break;
      case "orders":      nodes.sort((a, b) => b.totalOrders - a.totalOrders); break;
    }
    return nodes;
  }, [data, searchQuery, clusterFilter, sortBy]);

  const activeSort = SORT_OPTIONS.find(s => s.val === sortBy)?.label || "Sort";

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("p-1.5 rounded-lg text-white shadow-lg", colors.primary)}>
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Behavioral Intelligence</span>
          </div>
          <h1 className="text-4xl font-[1000] text-slate-900 dark:text-white tracking-tight">Purchase Profiles</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Deep analysis of customer commerce patterns and SKU affinity.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/analytics")} className={cn("h-12 px-8 rounded-xl text-white font-black uppercase text-[10px] tracking-widest shadow-xl shrink-0", colors.primary)}>
          <BarChart3 className="h-4 w-4 mr-2" /> Neural Analytics
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm space-y-8 h-fit">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Filter</h3>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search Node..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-10 pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full h-10 rounded-xl border-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 justify-between font-bold text-[10px] uppercase tracking-widest text-slate-500">
                  {activeSort} <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-2xl border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-2xl p-2 min-w-[180px]">
                {SORT_OPTIONS.map(opt => (
                  <DropdownMenuItem
                    key={opt.val}
                    onClick={() => setSortBy(opt.val)}
                    className={cn("rounded-xl h-10 font-black uppercase tracking-widest text-[10px] cursor-pointer", sortBy === opt.val ? "bg-indigo-600 text-white" : "text-slate-500 dark:text-slate-400")}
                  >
                    {opt.label}
                    {sortBy === opt.val && <CheckCircle2 className="ml-auto h-3 w-3" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cluster Status</h3>
            <div className="space-y-2">
              <button
                onClick={() => setClusterFilter(null)}
                className={cn("w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                  clusterFilter === null ? "bg-slate-900 dark:bg-indigo-600 border-transparent" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-slate-200")}
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className={cn("text-[10px] font-bold uppercase tracking-tight", clusterFilter === null ? "text-white" : "text-slate-600 dark:text-slate-400")}>All Customers</span>
                </div>
                <span className={cn("text-xs font-black", clusterFilter === null ? "text-white" : "text-slate-900 dark:text-white")}>{data?.nodes.length || 0}</span>
              </button>
              {(["High Velocity", "Dormant", "At Risk"] as const).map(status => {
                const cfg = STATUS_CONFIG[status];
                return (
                  <button
                    key={status}
                    onClick={() => setClusterFilter(clusterFilter === status ? null : status)}
                    className={cn("w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                      clusterFilter === status ? "bg-slate-900 dark:bg-slate-800 border-transparent" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-slate-200")}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", cfg.color)} />
                      <span className={cn("text-[10px] font-bold uppercase tracking-tight", clusterFilter === status ? "text-white" : "text-slate-600 dark:text-slate-400")}>{status}</span>
                    </div>
                    <span className={cn("text-xs font-black", clusterFilter === status ? "text-white" : "text-slate-900 dark:text-white")}>{data?.clusterCounts?.[status] || 0}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {data && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Neural Spend</p>
              <p className="text-xl font-[1000] text-slate-900 dark:text-white tracking-tighter">
                Le {Math.round(data.nodes.reduce((s, n) => s + n.totalVolume, 0)).toLocaleString()}
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase">{data.nodes.length} Customer Nodes</p>
            </div>
          )}
        </Card>

        {/* Main */}
        <div className="lg:col-span-3 space-y-6">
          {(searchQuery || clusterFilter) && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                  Search: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery("")}><X className="h-3 w-3" /></button>
                </span>
              )}
              {clusterFilter && (
                <span className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest", STATUS_CONFIG[clusterFilter as keyof typeof STATUS_CONFIG].bg, STATUS_CONFIG[clusterFilter as keyof typeof STATUS_CONFIG].text)}>
                  {clusterFilter}
                  <button onClick={() => setClusterFilter(null)}><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-52 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800/50 animate-pulse" />)}
            </div>
          ) : filteredNodes.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center space-y-6">
              <div className="h-20 w-20 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <UserCheck className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No profiles found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {data?.nodes.length === 0 ? "Complete sales to customers to build behavioral profiles." : "Try adjusting your search or filter."}
                </p>
              </div>
              {(searchQuery || clusterFilter) && (
                <Button variant="outline" onClick={() => { setSearchQuery(""); setClusterFilter(null); }} className="rounded-xl font-black uppercase text-[10px] tracking-widest">
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredNodes.map((profile, i) => {
                  const cfg = STATUS_CONFIG[profile.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <motion.div key={profile.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, delay: i * 0.04 }}>
                      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm group hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/30 transition-all cursor-pointer" onClick={() => setSelectedProfile(profile)}>
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner group-hover:scale-110 transition-transform duration-300 font-[1000] text-xl text-slate-400">
                              {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 dark:text-white tracking-tight leading-none">{profile.name}</h4>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">ID: {profile.id.substring(0, 8)}</p>
                            </div>
                          </div>
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-[1000] uppercase tracking-widest", cfg.bg, cfg.text)}>
                            <StatusIcon className="h-3 w-3" />{profile.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 border-t border-slate-50 dark:border-slate-800 pt-5">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Primary Affinity</p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-1 uppercase italic truncate">{profile.primaryAffinity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Neural Spend</p>
                            <p className="text-base font-[1000] text-slate-900 dark:text-white tracking-tighter mt-1">Le {Math.round(profile.totalVolume).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Orders</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{profile.totalOrders}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Seen</p>
                            <p className="text-xs font-black text-slate-500 dark:text-slate-400 mt-1">{profile.daysSinceLastPurchase}d ago</p>
                          </div>
                        </div>
                        <Button variant="ghost" className="w-full mt-5 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                          View Profile <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Audience Segmentation */}
          <Card className="border-none bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-indigo-400" />
                  <h3 className="text-2xl font-[1000] tracking-tight uppercase italic">Audience Segmentation</h3>
                </div>
                <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-widest max-w-sm">
                  Our neural engines have detected emerging customer clusters based on your latest commerce data.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {data && Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                      <div className={cn("h-2 w-2 rounded-full", cfg.color)} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{key}: {data.clusterCounts[key] || 0}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={loadData} className="h-12 px-8 rounded-xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                  <Sparkles className="h-4 w-4 mr-2" /> Refresh Intelligence
                </Button>
              </div>
              <div className="w-full md:w-40 aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-2 shrink-0">
                <p className="text-3xl font-[1000] text-white">{data?.nodes.length || 0}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Active Nodes</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Profile Detail Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="sm:max-w-[480px] w-[95vw] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950">
          {selectedProfile && (() => {
            const cfg = STATUS_CONFIG[selectedProfile.status];
            const StatusIcon = cfg.icon;
            return (
              <>
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px]" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-[1000] text-2xl">
                      {selectedProfile.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-1">Customer Intelligence Node</p>
                      <h2 className="text-2xl font-[1000] tracking-tight">{selectedProfile.name}</h2>
                      <span className={cn("inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-xl text-[9px] font-[1000] uppercase tracking-widest", cfg.bg, cfg.text)}>
                        <StatusIcon className="h-3 w-3" /> {selectedProfile.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-6 bg-white dark:bg-slate-950">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contact Details</p>
                    <div className="space-y-2">
                      {selectedProfile.phone && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <Phone className="h-4 w-4 text-indigo-400" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedProfile.phone}</span>
                        </div>
                      )}
                      {selectedProfile.email && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <Mail className="h-4 w-4 text-indigo-400" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedProfile.email}</span>
                        </div>
                      )}
                      {!selectedProfile.phone && !selectedProfile.email && (
                        <p className="text-xs font-bold text-slate-400 italic">No contact information available.</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Total Spend",    value: `Le ${Math.round(selectedProfile.totalVolume).toLocaleString()}`, icon: TrendingUp,  color: "text-emerald-500" },
                      { label: "Total Orders",   value: selectedProfile.totalOrders.toString(),                           icon: ShoppingBag, color: "text-indigo-500"  },
                      { label: "Last Purchase",  value: `${selectedProfile.daysSinceLastPurchase}d ago`,                  icon: Clock,       color: "text-amber-500"  },
                      { label: "SKU Affinity",   value: selectedProfile.primaryAffinity,                                  icon: BarChart3,   color: "text-rose-500"   },
                    ].map(m => (
                      <div key={m.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                          <m.icon className={cn("h-4 w-4", m.color)} />
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{m.label}</p>
                        </div>
                        <p className="text-sm font-[1000] text-slate-900 dark:text-white truncate">{m.value}</p>
                      </div>
                    ))}
                  </div>
                  {selectedProfile.status === "At Risk" && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                      <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-rose-700 dark:text-rose-400 leading-relaxed">
                        This customer has not purchased in over 60 days. Consider a re-engagement offer or WhatsApp follow-up.
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setSelectedProfile(null)} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-slate-200 dark:border-slate-800 dark:text-slate-400">
                      Close
                    </Button>
                    <Button onClick={() => { setSelectedProfile(null); router.push("/dashboard/customers"); }} className="flex-[2] h-12 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl">
                      Go to Customer <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
