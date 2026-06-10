"use client";

import { useState, useEffect, useMemo } from "react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  ChevronRight, 
  Star, 
  Info, 
  ArrowRight,
  CheckCircle2,
  Box,
  Truck,
  FileText,
  Clock,
  ExternalLink,
  ChevronDown,
  X,
  History,
  MoreVertical,
  Activity,
  User,
  ShieldCheck,
  Package,
  ArrowUpRight,
  Receipt,
  Wallet,
  Smartphone,
  AlertCircle,
  Layout,
  Edit,
  Filter,
  MapPin,
  Pencil,
  FileDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getRecentSales } from "@/lib/actions/sale";
import { Badge } from "@/components/ui/badge";

const SALES_ORDER_VIEWS = [
  { id: "all", label: "All Sales Orders", empty: "No records found." },
  { id: "draft", label: "Draft Sales Orders", empty: "There are no sales orders draft." },
  { id: "pending_approval", label: "Pending Approval Sales Orders", empty: "There are no sales orders pending approval." },
  { id: "approved", label: "Approved Sales Orders", empty: "There are no sales orders approved." },
  { id: "confirmed", label: "Confirmed Sales Orders", empty: "There are no sales orders confirmed." },
  { id: "for_packaging", label: "Sales Orders for Packaging", empty: "No Records Found" },
  { id: "to_be_shipped", label: "To be Shipped Sales Orders", empty: "There are no sales orders to be shipped." },
  { id: "shipped", label: "Shipped Sales Orders", empty: "There are no sales orders shipped." },
  { id: "onhold", label: "On Hold Sales Orders", empty: "There are no sales orders on hold." },
  { id: "fulfilled", label: "Fulfilled Sales Orders", empty: "There are no fulfilled sales orders." },
  { id: "closed", label: "Closed Sales Orders", empty: "There are no closed sales orders." },
  { id: "customer_viewed", label: "Customer Viewed Sales Orders", empty: "There are no sales orders customer viewed." },
  { id: "manually_fulfilled", label: "Manually Fulfilled Sales Orders", empty: "There are no sales orders manually fulfilled." },
  { id: "for_invoicing", label: "For Invoicing Sales Orders", empty: "There are no sales orders for invoicing." },
  { id: "drop_shipped", label: "Drop Shipped Sales Orders", empty: "There are no sales orders drop shipped." },
  { id: "backorder", label: "Backorder Sales Orders", empty: "There are no sales orders backorder." },
  { id: "marketplace", label: "Marketplace Sales Orders", empty: "There are no marketplace sales orders." },
  { id: "void", label: "Void Sales Orders", empty: "There are no void sales orders." },
  { id: "invoiced", label: "Invoiced Sales Orders", empty: "There are no sales orders invoiced." },
  { id: "shipped_not_invoiced", label: "Shipped & Not Invoiced", empty: "There are no sales orders shipped and not invoiced." },
  { id: "invoiced_not_shipped", label: "Invoiced & Not Shipped", empty: "There are no sales orders invoiced and not shipped." },
  { id: "new_custom", label: "New Custom View", isAction: true }
];

export default function SalesOrdersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState("all");
  const [viewSearch, setViewSearch] = useState("");
  const [starredViews, setStarredViews] = useState<string[]>(["all"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    try {
      setLoading(true);
      const data = await getRecentSales();
      setSales(data || []);
    } catch (error) {
      toast.error("Cloud sync failed for sales records.");
    } finally {
      setLoading(false);
    }
  }

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStarredViews(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const filteredViews = SALES_ORDER_VIEWS.filter(v => 
    v.label.toLowerCase().includes(viewSearch.toLowerCase())
  );

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (viewFilter === "all") return matchesSearch;
    if (viewFilter === "draft") return matchesSearch && s.status === "DRAFT";
    if (viewFilter === "pending_approval") return matchesSearch && s.status === "PENDING_APPROVAL";
    if (viewFilter === "approved") return matchesSearch && s.status === "APPROVED";
    // General fallback for other statuses
    return matchesSearch && s.status.toLowerCase() === viewFilter.replace(/_/g, ' ');
  });

  const activeView = SALES_ORDER_VIEWS.find(v => v.id === viewFilter) || SALES_ORDER_VIEWS[0];
  const isStatusView = viewFilter !== "all";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans animate-in fade-in duration-700 pb-20">
      
      {/* Header with View Switcher */}
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-[50] backdrop-blur-md bg-white/80 text-slate-900">
         <div className="flex items-center gap-8 flex-1">
            <DropdownMenu onOpenChange={(open) => !open && setViewSearch("")}>
               <DropdownMenuTrigger asChild>
                  <button className="group flex items-center gap-3 outline-none focus:outline-none text-left">
                     <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                        <ShoppingCart className="h-5 w-5" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-none flex items-center gap-3">
                           {activeView.label}
                           <ChevronDown className="h-5 w-5 text-indigo-600 group-hover:translate-y-0.5 transition-transform" />
                        </h1>
                     </div>
                  </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent className="rounded-[2.5rem] border-slate-100 shadow-2xl p-4 min-w-[350px] bg-white animate-in zoom-in-95 duration-200" sideOffset={20}>
                  <div className="relative mb-4 px-2">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                     <Input 
                       placeholder="Search views..." 
                       value={viewSearch}
                       onChange={(e) => setViewSearch(e.target.value)}
                       className="h-10 pl-10 rounded-xl border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-600/10 transition-all"
                     />
                  </div>
                  <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar px-1">
                     {/* Favorites Section */}
                     {starredViews.length > 0 && (
                       <div className="mb-6 space-y-1">
                          <div className="px-4 py-2 text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                             <Star className="h-3 w-3 fill-current" /> Favorites
                          </div>
                          {SALES_ORDER_VIEWS.filter(v => starredViews.includes(v.id)).map(view => (
                            <DropdownMenuItem 
                              key={`fav-${view.id}`} 
                              onClick={() => setViewFilter(view.id)}
                              className={cn(
                                "rounded-xl h-12 font-black uppercase tracking-widest text-[10px] px-4 cursor-pointer transition-all flex items-center justify-between group bg-slate-50/50",
                                viewFilter === view.id 
                                  ? "bg-indigo-600 text-white shadow-xl" 
                                  : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                              )}
                            >
                               <div className="flex items-center gap-4">
                                  <button 
                                    onClick={(e) => toggleStar(e, view.id)}
                                    className="text-yellow-400 scale-110 transition-transform hover:scale-125"
                                  >
                                     <Star className="h-4 w-4 fill-current" />
                                  </button>
                                  <span>{view.label}</span>
                               </div>
                               {viewFilter === view.id && <CheckCircle2 className="h-4 w-4" />}
                            </DropdownMenuItem>
                          ))}
                          <div className="h-px bg-slate-100 mx-2 my-4" />
                       </div>
                     )}

                     {/* All Views Section */}
                     {starredViews.length > 0 && (
                       <div className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                          All Views
                       </div>
                     )}
                     
                     {filteredViews.map(view => (
                       <DropdownMenuItem 
                         key={view.id} 
                         onClick={() => setViewFilter(view.id)}
                         className={cn(
                           "rounded-xl h-12 font-black uppercase tracking-widest text-[10px] px-4 cursor-pointer transition-all flex items-center justify-between group",
                           viewFilter === view.id 
                             ? "bg-indigo-600 text-white shadow-xl" 
                             : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                         )}
                       >
                          <div className="flex items-center gap-4">
                             <button 
                               onClick={(e) => toggleStar(e, view.id)}
                               className={cn(
                                 "transition-all duration-300",
                                 starredViews.includes(view.id) 
                                   ? "text-yellow-400 scale-125" 
                                   : "text-slate-300 group-hover:text-slate-400"
                               )}
                             >
                                <Star className={cn("h-4 w-4", starredViews.includes(view.id) && "fill-current")} />
                             </button>
                             <span>{view.label}</span>
                          </div>
                          {viewFilter === view.id && <CheckCircle2 className="h-4 w-4" />}
                          {view.isAction && <Plus className="h-3 w-3 ml-auto text-indigo-600" />}
                       </DropdownMenuItem>
                     ))}
                  </div>
               </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 pl-4 border-l border-slate-100 dark:border-slate-800">
               <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Reports</button>
               <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Documents</button>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <Button 
              onClick={() => router.push("/dashboard/sales/orders/new")}
              className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
            >
               <Plus className="h-5 w-5" /> New
            </Button>
         </div>
      </header>

      {/* View Order Stats Board (Active for all status-specific views) */}
      {isStatusView && (
        <div className="px-8 pt-8 animate-in slide-in-from-top duration-500 text-slate-900">
           <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Activity className="h-5 w-5 text-indigo-600" />
                       <h3 className="text-xl font-black uppercase tracking-tight italic text-slate-900 dark:text-white">View Order Stats</h3>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed max-w-sm italic">Live monitoring of your {viewFilter.replace(/_/g, ' ')} sales pipelines.</p>
                 </div>

                 <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: "Order Status", value: "None", color: "text-slate-400" },
                      { label: "Invoiced", value: "0.00%", color: "text-emerald-500" },
                      { label: "Payment", value: "Unpaid", color: "text-rose-500" },
                      { label: "Packed", count: 0, status: "Pending" },
                      { label: "Shipped", count: 0, status: "None" }
                    ].map((s, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-1 group hover:border-indigo-600/20 transition-all">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                         <span className={cn("text-sm font-black uppercase tracking-tight italic", s.color || "text-slate-900 dark:text-white")}>{s.value || s.status}</span>
                      </div>
                    ))}
                 </div>

                 <div className="h-16 w-1 bg-slate-100 dark:bg-slate-800 rounded-full hidden lg:block" />
                 
                 <div className="flex flex-col items-end">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivery Method</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">No Records Found</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Main List Content */}
      <div className="flex-1 p-8 space-y-6">
        
        {/* Table Action Bar */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              {/* Customize Columns Button */}
              <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-slate-100 bg-white shadow-sm hover:bg-slate-50">
                       <Layout className="h-5 w-5 text-slate-400" />
                    </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent className="rounded-2xl border-slate-100 shadow-2xl p-4 w-64 bg-white">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 italic px-1">Table Controls</p>
                       <div className="space-y-1">
                          <DropdownMenuItem className="rounded-xl h-11 font-bold text-xs gap-3 px-4">
                             <Pencil className="h-4 w-4 text-slate-400" /> Customize Columns
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl h-11 font-bold text-xs gap-3 px-4">
                             <Box className="h-4 w-4 text-slate-400" /> Clip Text
                          </DropdownMenuItem>
                       </div>
                    </div>
                 </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="h-6 w-px bg-slate-100 mx-2" />
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                 <CheckCircle2 className="h-3.5 w-3.5" /> Select All
              </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                 <input 
                   placeholder="Search sales orders..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="h-11 w-64 pl-11 rounded-xl bg-slate-50 border-none text-sm font-medium focus:ring-4 focus:ring-indigo-600/10 transition-all"
                 />
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setShowAdvancedSearch(true)}
                className="h-11 w-11 p-0 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                 <Filter className="h-5 w-5" />
              </Button>
           </div>
        </div>

        {/* Sales Order Table */}
        <div className="rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden border border-slate-50 dark:border-slate-800">
           <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50 h-16">
                 <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                    <TableHead className="w-[60px] pl-8">
                       <Checkbox className="rounded-md border-slate-300" />
                    </TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Date</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Sales Order#</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Reference#</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Customer Name</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Order Status</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Invoiced</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Payment</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Packed</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Shipped</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Delivery Method</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-right pr-8">Amount</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-50 dark:divide-slate-800 text-slate-900">
                {loading ? (
                   [1,2,3].map(i => <TableRow key={i} className="h-20 animate-pulse bg-slate-50/20 border-none" />)
                ) : filteredSales.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={12} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 text-slate-300 italic font-black uppercase text-[11px] tracking-[0.5em]">
                           <Box className="h-10 w-10 opacity-20" />
                           {activeView.empty}
                        </div>
                     </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 border-none group transition-all">
                      <TableCell className="pl-8">
                         <Checkbox className="rounded-md border-slate-300" />
                      </TableCell>
                      <TableCell className="py-6">
                        <span className="text-[11px] font-black text-slate-400 uppercase">{format(new Date(sale.createdAt), "dd MMM yyyy")}</span>
                      </TableCell>
                      <TableCell>
                         <span className="font-black text-indigo-600 text-[11px] tracking-widest uppercase italic">{sale.invoiceNumber}</span>
                      </TableCell>
                      <TableCell>
                         <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">REF-001</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-black text-slate-900 dark:text-white uppercase italic text-[11px] tracking-tight">{sale.customerName}</span>
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-400 bg-white">{sale.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center"><CheckCircle2 className="h-4 w-4 text-slate-100 mx-auto" /></TableCell>
                      <TableCell className="text-center"><CheckCircle2 className="h-4 w-4 text-slate-100 mx-auto" /></TableCell>
                      <TableCell className="text-center"><CheckCircle2 className="h-4 w-4 text-slate-100 mx-auto" /></TableCell>
                      <TableCell className="text-center"><CheckCircle2 className="h-4 w-4 text-slate-100 mx-auto" /></TableCell>
                      <TableCell>
                         <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Standard</span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                         <span className="font-[1000] text-slate-900 dark:text-white tracking-tighter italic">NLe {Math.round(parseFloat(sale.totalAmount)).toLocaleString()}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
           </Table>
        </div>
      </div>

      {/* ADVANCED SEARCH FILTER DIALOG */}
      <Dialog open={showAdvancedSearch} onOpenChange={setShowAdvancedSearch}>
        <DialogContent className="sm:max-w-[700px] rounded-[3rem] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] p-0 overflow-hidden bg-white text-slate-900">
           <div className="bg-slate-950 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Search size={140} />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                 <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Advanced Intelligence</div>
                    <h3 className="text-4xl font-[1000] tracking-tighter uppercase italic leading-none">Search Filter</h3>
                 </div>
                 <button onClick={() => setShowAdvancedSearch(false)} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all">
                    <X className="h-6 w-6" />
                 </button>
              </div>
           </div>

           <div className="p-10 space-y-10 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sales Order#</Label>
                    <Input className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reference#</Label>
                    <Input className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                 </div>
                 
                 <div className="space-y-2 md:col-span-2 border-t border-slate-50 pt-6">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">Date Range (From - To)</Label>
                    <div className="grid grid-cols-2 gap-4">
                       <Input type="date" className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                       <Input type="date" className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                    </div>
                 </div>

                 <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Shipment Date Range</Label>
                    <div className="grid grid-cols-2 gap-4">
                       <Input type="date" className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                       <Input type="date" className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                    </div>
                 </div>

                 <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Created Between</Label>
                    <div className="grid grid-cols-2 gap-4">
                       <Input type="date" className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                       <Input type="date" className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</Label>
                    <Select>
                       <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold">
                          <SelectValue placeholder="All Statuses" />
                       </SelectTrigger>
                       <SelectContent>
                          {SALES_ORDER_VIEWS.map(v => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Item Name</Label>
                    <Input className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                 </div>

                 <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Item Description</Label>
                    <Input className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Total Range (NLe)</Label>
                    <div className="flex items-center gap-3">
                       <Input placeholder="Min" className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                       <span className="text-slate-300">-</span>
                       <Input placeholder="Max" className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Customer Name</Label>
                    <Input className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Salesperson</Label>
                    <Input className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tax Engine</Label>
                    <Input className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                 </div>

                 <div className="md:col-span-2 pt-6 border-t border-slate-50 space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 italic">Address Mapping</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <Label className="text-[11px] font-[1000] uppercase tracking-tight text-slate-900 flex items-center gap-2">
                             <MapPin className="h-3.5 w-3.5 text-indigo-400" /> Billing Address
                          </Label>
                          <Input placeholder="Search billing zone..." className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                       </div>
                       <div className="space-y-4">
                          <Label className="text-[11px] font-[1000] uppercase tracking-tight text-slate-900 flex items-center gap-2">
                             <Truck className="h-3.5 w-3.5 text-indigo-400" /> Shipping Address
                          </Label>
                          <Input placeholder="Search shipping zone..." className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-10 pt-0 flex gap-4 bg-white relative z-10">
              <Button className="flex-1 h-16 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl hover:scale-[1.02] transition-all">Apply Filter</Button>
              <Button variant="outline" onClick={() => setShowAdvancedSearch(false)} className="flex-1 h-16 rounded-2xl font-black uppercase text-[11px] tracking-widest text-slate-400 border-slate-100 hover:bg-slate-50">Reset Configuration</Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
