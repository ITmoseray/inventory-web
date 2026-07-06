"use client";

import { useState, useEffect } from "react";
import { Globe, Search, Import, Briefcase, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getNetworkRegistry, sourceItem } from "@/lib/actions/network";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/layout/ModuleHeader";

type NetworkItem = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  unitPrice: number | null;
  category: { name: string } | null;
  business: { name: string; type?: string };
};

export default function NetworkSourcingPage() {
  const [items, setItems]         = useState<NetworkItem[]>([]);
  const [sourced, setSourced]     = useState<Set<string>>(new Set());
  const [loading, setLoading]     = useState(true);
  const [sourcingId, setSourcingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PRODUCT" | "SERVICE">("ALL");
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetchRegistry();
  }, []);

  async function fetchRegistry() {
    try {
      setLoading(true);
      setFetchError(false);
      const data = await getNetworkRegistry();
      setItems(data as NetworkItem[]);
    } catch (error) {
      setFetchError(true);
      toast.error("Failed to load network registry.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSource(item: NetworkItem) {
    try {
      setSourcingId(item.id);
      await sourceItem(item.id);
      setSourced(prev => new Set([...prev, item.id]));
      toast.success(`"${item.name}" sourced to your local inventory!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to source item.");
    } finally {
      setSourcingId(null);
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.business.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "ALL" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl md:text-4xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">
              Protech <span className="text-indigo-650 dark:text-indigo-400">Network Exchange</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Discover and source products from other stores on the network.</p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex-1 border-none shadow-sm bg-white dark:bg-slate-900/60 p-2 rounded-2xl">
          <div className="relative group">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-650 dark:group-focus-within:text-indigo-400 transition-colors" />
            <Input
              placeholder="Search products, services, or partner businesses..."
              className="pl-10 h-11 rounded-xl border-none bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-450 focus-visible:ring-1 focus-visible:ring-indigo-600/30 text-sm font-bold"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        </Card>

        <Tabs value={filterType} onValueChange={(v: string) => setFilterType((v || "ALL") as "ALL" | "PRODUCT" | "SERVICE")} className="w-full lg:w-auto">
          <TabsList className="h-14 p-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80">
            <TabsTrigger value="ALL" className="px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 data-[state=active]:bg-slate-950 dark:data-[state=active]:bg-slate-850 data-[state=active]:text-white">All Nodes</TabsTrigger>
            <TabsTrigger value="PRODUCT" className="px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 text-slate-600 dark:text-slate-400 data-[state=active]:bg-slate-950 dark:data-[state=active]:bg-slate-850 data-[state=active]:text-white">
              <Package className="h-3 w-3" /> Products
            </TabsTrigger>
            <TabsTrigger value="SERVICE" className="px-6 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 text-slate-600 dark:text-slate-400 data-[state=active]:bg-slate-950 dark:data-[state=active]:bg-slate-850 data-[state=active]:text-white">
              <Briefcase className="h-3 w-3" /> Services
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3,4,5,6].map((i: number) => (
            <Card key={i} className="h-64 rounded-3xl animate-pulse bg-slate-100 dark:bg-slate-800/50 border-none" />
          ))
        ) : fetchError ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-rose-100 dark:border-rose-950/20 gap-4">
            <Globe className="h-12 w-12 text-rose-300 dark:text-rose-600" />
            <p className="text-rose-500 font-black uppercase tracking-widest text-sm">Network connection failed</p>
            <Button onClick={fetchRegistry} variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest">Retry</Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800/80 gap-4">
            <Globe className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-450 dark:text-slate-500 font-black uppercase tracking-widest text-sm">
              {searchQuery || filterType !== "ALL" ? "No items match your search" : "No items in the network exchange"}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredItems.map((item) => {
              const isSourced = sourced.has(item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/40 h-full flex flex-col">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={cn(
                          "h-6 px-3 rounded-lg font-black text-[10px] uppercase tracking-widest border-none",
                          item.type === "SERVICE" 
                            ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" 
                            : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                        )}>
                          {item.type}
                        </Badge>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sourced from</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{item.business.name}</span>
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-black text-slate-800 dark:text-white tracking-tight group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                        {item.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 font-medium text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                        {item.description || "No description provided by the originating business node."}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 flex-1">
                      <div className="pt-6 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Value</span>
                          <span className="text-xl font-[1000] text-slate-900 dark:text-white tracking-tighter italic">
                            {item.unitPrice != null ? `Le ${Math.round(item.unitPrice).toLocaleString()}` : "—"}
                          </span>
                        </div>
                        {item.category && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domain</span>
                            <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400">{item.category.name}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="p-8 pt-0">
                      <Button
                        onClick={() => !isSourced && handleSource(item)}
                        disabled={sourcingId === item.id || isSourced}
                        className={cn(
                          "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest gap-3 transition-all",
                          isSourced
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 cursor-default"
                            : "bg-slate-950 hover:bg-indigo-650 dark:bg-slate-800 dark:hover:bg-indigo-600 text-white group-hover:scale-[1.02]"
                        )}
                      >
                        {isSourced ? (
                          <><CheckCircle2 className="h-4 w-4 text-emerald-650 dark:text-emerald-400" /> Already Sourced</>
                        ) : sourcingId === item.id ? (
                          <>Sourcing...</>
                        ) : (
                          <><Import className="h-4 w-4" /> Source to Inventory</>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
