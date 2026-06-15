"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ShieldCheck, 
  Search, 
  Users, 
  Truck, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  MoreVertical,
  Filter,
  Download,
  Zap,
  Star,
  Globe,
  Database,
  Link as LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getRegistryIntelligence } from "@/lib/actions/registry";
import { format } from "date-fns";
import { toast } from "sonner";

export default function RegistryHubPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "CUSTOMER" | "SUPPLIER">("ALL");

  useEffect(() => {
    fetchIntelligence();
  }, []);

  async function fetchIntelligence() {
    try {
      setLoading(true);
      const res = await getRegistryIntelligence();
      setData(res);
    } catch (e) {
      toast.error("Failed to sync with commercial registry nodes.");
    } finally {
      setLoading(false);
    }
  }

  const filteredNodes = useMemo(() => {
    if (!data) return [];
    return data.nodes.filter((n: any) => {
      const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (n.email && n.email.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === "ALL" || n.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [data, searchQuery, typeFilter]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-6"
        >
           <div className="h-20 w-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
              <ShieldCheck className="h-10 w-10" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Synchronizing Global Commercial Nodes...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 md:p-10 space-y-10 bg-slate-50/30 dark:bg-slate-950/30 selection:bg-indigo-600/10 selection:text-indigo-600">
      
      {/* 1. MASTER HUB HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm w-fit">
              <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Network Online</span>
           </div>
           <div className="space-y-1">
              <h1 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase italic text-slate-950 dark:text-white leading-none">Partner <span className="text-indigo-600">Directory</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em] italic mt-2">Business Insights & Profile Explorer</p>
           </div>
        </div>
        
        <div className="flex gap-4">
           <Button className="h-16 px-10 rounded-[2rem] bg-slate-950 dark:bg-indigo-600 text-white font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-[1.05] transition-all active:scale-95 gap-3">
              <Zap className="h-4 w-4" /> Refresh Data
           </Button>
        </div>
      </div>

      {/* 2. INTELLIGENCE KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="rounded-[3rem] border-none shadow-sm bg-white dark:bg-slate-900 p-10 group hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-full translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="p-0 pb-8 flex flex-row items-center justify-between">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Total Partners</CardTitle>
               <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600"><Users size={20} /></div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="text-6xl font-[1000] tracking-tighter italic text-slate-950 dark:text-white">{data?.stats?.totalEntities || 0}</div>

               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Verified business partners</p>
            </CardContent>
         </Card>

         <Card className="rounded-[3rem] border-none shadow-sm bg-white dark:bg-slate-900 p-10 group hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-full translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="p-0 pb-8 flex flex-row items-center justify-between">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Trust Score</CardTitle>
               <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600"><Star size={20} /></div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="text-6xl font-[1000] tracking-tighter italic text-slate-950 dark:text-white">{(data?.stats.globalReliability || 0).toFixed(1)}%</div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 italic">Aggregate network reliability</p>
            </CardContent>
         </Card>

         <Card className="rounded-[3rem] border-none shadow-sm bg-white dark:bg-slate-900 p-10 group hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-950/90 rounded-full translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="p-0 pb-8 flex flex-row items-center justify-between relative z-10">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Trade Volume</CardTitle>
               <div className="h-12 w-12 rounded-2xl bg-slate-950 dark:bg-slate-800 flex items-center justify-center text-white"><TrendingUp size={20} /></div>
            </CardHeader>
            <CardContent className="p-0 relative z-10">
               <div className="text-6xl font-[1000] tracking-tighter italic text-slate-950 dark:text-white">NLe {(data?.stats.totalTradeVolume || 0).toLocaleString()}</div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Total transaction value</p>
            </CardContent>
         </Card>
      </div>

      {/* 3. EXPLORER WORKSPACE */}
      <Card className="rounded-[4rem] border-none shadow-sm bg-white dark:bg-slate-900 p-12 overflow-hidden">
         {/* Workspace Toolbar */}
         <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 pb-10 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-6 w-full md:w-auto">
               <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <Button 
                    variant={typeFilter === "ALL" ? "default" : "ghost"} 
                    onClick={() => setTypeFilter("ALL")}
                    className={cn("h-11 rounded-xl px-6 font-black uppercase text-[10px] tracking-widest transition-all", typeFilter === "ALL" && "bg-indigo-600 shadow-lg shadow-indigo-500/20")}
                  >All Partners</Button>
                  <Button 
                    variant={typeFilter === "CUSTOMER" ? "default" : "ghost"} 
                    onClick={() => setTypeFilter("CUSTOMER")}
                    className={cn("h-11 rounded-xl px-6 font-black uppercase text-[10px] tracking-widest transition-all", typeFilter === "CUSTOMER" && "bg-indigo-600 shadow-lg shadow-indigo-500/20")}
                  >Customers</Button>
                  <Button 
                    variant={typeFilter === "SUPPLIER" ? "default" : "ghost"} 
                    onClick={() => setTypeFilter("SUPPLIER")}
                    className={cn("h-11 rounded-xl px-6 font-black uppercase text-[10px] tracking-widest transition-all", typeFilter === "SUPPLIER" && "bg-indigo-600 shadow-lg shadow-indigo-500/20")}
                  >Suppliers</Button>
               </div>
            </div>

            <div className="flex flex-1 items-center gap-4 w-full md:max-w-xl">
               <div className="relative flex-1 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <Input 
                    placeholder="Search partner directory..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-16 pl-16 pr-8 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-900 text-sm font-bold tracking-tight shadow-inner"
                  />
               </div>
               <Button variant="outline" className="h-16 px-8 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-black uppercase text-[10px] tracking-widest gap-4"><Filter size={18} /> Filters</Button>
               <Button variant="outline" className="h-16 px-8 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-black uppercase text-[10px] tracking-widest gap-4"><Download size={18} /> Export</Button>
            </div>
         </div>

         {/* Intelligence Table */}
         <div className="rounded-[2.5rem] border border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 overflow-hidden">
            <Table>
               <TableHeader className="bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800 sticky top-0 z-20">
                  <TableRow className="hover:bg-transparent border-none text-[11px] font-[1000] uppercase tracking-[0.4em] text-slate-300">
                     <TableHead className="h-20 px-10">Business Partner</TableHead>
                     <TableHead className="h-20 text-center">Type</TableHead>
                     <TableHead className="h-20">Reliability Score</TableHead>
                     <TableHead className="h-20">Trade Volume</TableHead>
                     <TableHead className="h-20">Last Order</TableHead>
                     <TableHead className="h-20 text-right pr-10">Actions</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {filteredNodes.map((node: any) => (
                     <TableRow key={node.id} className="group hover:bg-white dark:hover:bg-slate-900/50 transition-all border-b border-slate-50 dark:border-slate-800/50">
                        <TableCell className="px-10 h-28">
                           <div className="flex items-center gap-6">
                              <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center font-[1000] text-xl italic shadow-inner group-hover:scale-110 transition-transform",
                                node.type === "CUSTOMER" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                              )}>
                                 {node.name.charAt(0)}
                              </div>
                              <div>
                                 <div className="text-xl font-black text-slate-950 dark:text-white tracking-tighter italic leading-none mb-1.5">{node.name}</div>
                                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                                    <Globe className="h-3 w-3" /> {node.email || "NO_EMAIL_RECORDED"}
                                 </div>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="text-center">
                           <Badge className={cn(
                             "h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg border-none",
                             node.type === "CUSTOMER" ? "bg-indigo-600 text-white shadow-indigo-500/20" : "bg-emerald-600 text-white shadow-emerald-500/20"
                           )}>
                              {node.type}
                           </Badge>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-3 w-48">
                              <div className="flex justify-between items-end">
                                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Score</div>
                                 <div className={cn("text-sm font-black italic", node.reliability > 70 ? "text-emerald-500" : "text-amber-500")}>
                                    {node.reliability.toFixed(0)}%
                                 </div>
                              </div>
                              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                                 <div 
                                    className={cn("h-full rounded-full shadow-sm transition-all duration-1000", node.reliability > 70 ? "bg-emerald-500" : "bg-amber-500")}
                                    style={{ width: `${node.reliability}%` }}
                                 />
                              </div>
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="text-xl font-black text-slate-950 dark:text-white tracking-tighter italic">NLe {node.totalVolume.toLocaleString()}</div>
                           <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Trading Stream</div>
                        </TableCell>
                        <TableCell>
                           <div className="text-sm font-black text-slate-700 dark:text-slate-300 italic">{format(new Date(node.lastInteraction), "MMM do, yyyy")}</div>
                           <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Temporal Data Sync</div>
                        </TableCell>
                        <TableCell className="text-right pr-10">
                           <DropdownMenu>
                              <DropdownMenuTrigger render={
                                 <Button variant="ghost" className="h-12 w-12 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <MoreVertical className="h-5 w-5 text-slate-300" />
                                 </Button>
                              } />
                              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-100 dark:border-slate-800 shadow-2xl">
                                 <DropdownMenuItem className="h-11 rounded-xl font-bold text-xs gap-3"><Activity size={16} /> Business Analytics</DropdownMenuItem>
                                 <DropdownMenuItem className="h-11 rounded-xl font-bold text-xs gap-3"><Database size={16} /> Partner Profile</DropdownMenuItem>
                                 <DropdownMenuItem className="h-11 rounded-xl font-bold text-xs gap-3"><LinkIcon size={16} /> View Invoices</DropdownMenuItem>
                                 <div className="h-px bg-slate-50 dark:bg-slate-800 my-2" />
                                 <DropdownMenuItem className="h-11 rounded-xl font-bold text-xs gap-3 text-rose-500 focus:text-rose-600"><Zap size={16} /> End Relationship</DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </Card>
    </div>
  );
}
