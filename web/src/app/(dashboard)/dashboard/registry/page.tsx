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
        <div className="flex flex-col items-center gap-4">
           <div className="h-16 w-16 rounded-xl border-4 border-indigo-600 border-t-transparent animate-spin" />
           <p className="text-sm font-semibold text-slate-500">Loading Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 md:p-10 space-y-10 bg-slate-50/30 dark:bg-slate-950/30 selection:bg-indigo-600/10 selection:text-indigo-600">
      
      {/* 1. MASTER HUB HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Partner Directory</h1>
           <p className="text-sm text-slate-500">Manage customers, suppliers, and trading partners.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
           <Button className="h-10 px-4 rounded-md w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm gap-2">
              <Zap className="h-4 w-4" /> Refresh Directory
           </Button>
        </div>
      </div>

      {/* 2. INTELLIGENCE KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 rounded-xl">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-semibold text-slate-500">Total Partners</CardTitle>
               <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600"><Users size={18} /></div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="text-3xl font-bold text-slate-900 dark:text-white">{data?.stats?.totalEntities || 0}</div>
               <p className="text-xs text-slate-500 mt-1">Verified business partners</p>
            </CardContent>
         </Card>

         <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 rounded-xl">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-semibold text-slate-500">Trust Score</CardTitle>
               <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600"><Star size={18} /></div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="text-3xl font-bold text-slate-900 dark:text-white">{(data?.stats?.globalReliability || 0).toFixed(1)}%</div>
               <p className="text-xs text-slate-500 mt-1">Aggregate network reliability</p>
            </CardContent>
         </Card>

         <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 rounded-xl">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-semibold text-slate-500">Trade Volume</CardTitle>
               <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"><TrendingUp size={18} /></div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="text-3xl font-bold text-slate-900 dark:text-white truncate">Le {(data?.stats?.totalTradeVolume || 0).toLocaleString()}</div>
               <p className="text-xs text-slate-500 mt-1">Total transaction value</p>
            </CardContent>
         </Card>
      </div>

      {/* 3. EXPLORER WORKSPACE */}
      <Card className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 overflow-hidden">
         {/* Workspace Toolbar */}
         <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-full xl:w-auto overflow-x-auto no-scrollbar">
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 w-max min-w-full">
                  <Button 
                    variant={typeFilter === "ALL" ? "default" : "ghost"} 
                    onClick={() => setTypeFilter("ALL")}
                    className={cn("h-9 rounded-md px-4 text-sm font-medium transition-all whitespace-nowrap", typeFilter === "ALL" && "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm")}
                  >All Partners</Button>
                  <Button 
                    variant={typeFilter === "CUSTOMER" ? "default" : "ghost"} 
                    onClick={() => setTypeFilter("CUSTOMER")}
                    className={cn("h-9 rounded-md px-4 text-sm font-medium transition-all whitespace-nowrap", typeFilter === "CUSTOMER" && "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm")}
                  >Customers</Button>
                  <Button 
                    variant={typeFilter === "SUPPLIER" ? "default" : "ghost"} 
                    onClick={() => setTypeFilter("SUPPLIER")}
                    className={cn("h-9 rounded-md px-4 text-sm font-medium transition-all whitespace-nowrap", typeFilter === "SUPPLIER" && "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm")}
                  >Suppliers</Button>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-4 w-full xl:max-w-xl">
               <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search partner directory..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 pl-9 pr-4 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-600 text-sm w-full"
                  />
               </div>
               <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                 <Button variant="outline" className="h-10 flex-1 sm:flex-none px-4 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium gap-2"><Filter size={16} /> Filters</Button>
                 <Button variant="outline" className="h-10 flex-1 sm:flex-none px-4 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium gap-2"><Download size={16} /> Export</Button>
               </div>
            </div>
         </div>

         {/* Intelligence Table */}
         <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <Table>
               <TableHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent">
                     <TableHead className="h-12 px-6 font-semibold text-slate-600 dark:text-slate-300">Business Partner</TableHead>
                     <TableHead className="h-12 text-center font-semibold text-slate-600 dark:text-slate-300">Type</TableHead>
                     <TableHead className="h-12 font-semibold text-slate-600 dark:text-slate-300">Reliability Score</TableHead>
                     <TableHead className="h-12 font-semibold text-slate-600 dark:text-slate-300">Trade Volume</TableHead>
                     <TableHead className="h-12 font-semibold text-slate-600 dark:text-slate-300">Last Order</TableHead>
                     <TableHead className="h-12 text-right pr-6 font-semibold text-slate-600 dark:text-slate-300">Actions</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {filteredNodes.map((node: any) => (
                     <TableRow key={node.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-200 dark:border-slate-800">
                        <TableCell className="px-6 py-4">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg",
                                node.type === "CUSTOMER" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                              )}>
                                 {node.name.charAt(0)}
                              </div>
                              <div>
                                 <div className="font-semibold text-slate-900 dark:text-white leading-tight">{node.name}</div>
                                 <div className="text-xs text-slate-500 mt-1">
                                    {node.email || "No email available"}
                                 </div>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="text-center">
                           <Badge variant="outline" className={cn(
                             "px-2.5 py-1 text-[11px] font-semibold border",
                             node.type === "CUSTOMER" ? "border-indigo-200 text-indigo-700 bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:bg-indigo-950/30" : "border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-950/30"
                           )}>
                              {node.type}
                           </Badge>
                        </TableCell>
                        <TableCell>
                           <div className="w-32">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="text-xs text-slate-500">Score</span>
                                 <span className={cn("text-xs font-semibold", node.reliability > 70 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                                    {node.reliability.toFixed(0)}%
                                 </span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                 <div 
                                    className={cn("h-full rounded-full", node.reliability > 70 ? "bg-emerald-500" : "bg-amber-500")}
                                    style={{ width: `${node.reliability}%` }}
                                 />
                              </div>
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="font-semibold text-slate-900 dark:text-white">Le {node.totalVolume.toLocaleString()}</div>
                           <div className="text-xs text-slate-500 mt-0.5">Total Value</div>
                        </TableCell>
                        <TableCell>
                           <div className="font-medium text-slate-700 dark:text-slate-300">{format(new Date(node.lastInteraction), "MMM d, yyyy")}</div>
                           <div className="text-xs text-slate-500 mt-0.5">Latest Transaction</div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                           <DropdownMenu>
                              <DropdownMenuTrigger render={
                                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <MoreVertical className="h-4 w-4 text-slate-500" />
                                 </Button>
                              } />
                              <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-md border-slate-200 dark:border-slate-800">
                                 <DropdownMenuItem className="text-sm cursor-pointer"><Activity size={14} className="mr-2 text-slate-400" /> Analytics</DropdownMenuItem>
                                 <DropdownMenuItem className="text-sm cursor-pointer"><Database size={14} className="mr-2 text-slate-400" /> View Profile</DropdownMenuItem>
                                 <DropdownMenuItem className="text-sm cursor-pointer"><LinkIcon size={14} className="mr-2 text-slate-400" /> Invoices</DropdownMenuItem>
                                 <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                                 <DropdownMenuItem className="text-sm cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50"><Zap size={14} className="mr-2" /> Deactivate Partner</DropdownMenuItem>
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
