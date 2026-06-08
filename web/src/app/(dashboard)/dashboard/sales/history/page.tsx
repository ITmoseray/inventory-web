"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  FileDown, 
  Printer, 
  Clock, 
  User, 
  CreditCard, 
  ChevronRight,
  Receipt,
  ShoppingCart,
  ArrowUpDown,
  Smartphone as SmartphoneIcon,
  Wallet,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSalesHistoryByRange } from "@/lib/actions/sale";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, startOfYear, endOfYear } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn, getIndustryColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ResponsiveTable } from "@/components/shared/responsive-table";

export default function SalesHistoryPage() {
  const { data: session } = useSession();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterRange, setFilterRange] = useState("TODAY");

  const businessType = session?.user?.businessType || "SHOP";
  const colors = getIndustryColor(businessType);

  useEffect(() => {
    fetchSales();
  }, [filterRange]);

  async function fetchSales() {
    try {
      setLoading(true);
      const now = new Date();
      let start: Date, end: Date;

      switch (filterRange) {
        case "TODAY":
          start = startOfDay(now);
          end = endOfDay(now);
          break;
        case "THIS_WEEK":
          start = startOfWeek(now);
          end = endOfWeek(now);
          break;
        case "LAST_TWO_WEEKS":
          start = subDays(now, 14);
          end = now;
          break;
        case "LAST_MONTH":
          start = startOfMonth(subMonths(now, 1));
          end = endOfMonth(subMonths(now, 1));
          break;
        case "LAST_THREE_MONTHS":
          start = startOfMonth(subMonths(now, 3));
          end = endOfMonth(now);
          break;
        case "LAST_SIX_MONTHS":
          start = startOfMonth(subMonths(now, 6));
          end = endOfMonth(now);
          break;
        case "THIS_YEAR":
          start = startOfYear(now);
          end = endOfYear(now);
          break;
        case "ALL_TIME":
          start = new Date(2000, 0, 1);
          end = now;
          break;
        default:
          start = subDays(now, 30);
          end = now;
      }

      const data = await getSalesHistoryByRange(start, end);
      setSales(data);
    } catch (error) {
      toast.error("Failed to sync ledger data.");
    } finally {
      setLoading(false);
    }
  }

  const filteredSales = sales.filter(s => 
    s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const ranges = [
    { label: "Today", value: "TODAY" },
    { label: "This Week", value: "THIS_WEEK" },
    { label: "Last 2 Weeks", value: "LAST_TWO_WEEKS" },
    { label: "Last Month", value: "LAST_MONTH" },
    { label: "Last 3 Months", value: "LAST_THREE_MONTHS" },
    { label: "Last 6 Months", value: "LAST_SIX_MONTHS" },
    { label: "This Year", value: "THIS_YEAR" },
    { label: "All Sales", value: "ALL_TIME" },
  ];

  const handleExportCSV = () => {
    const headers = ["Invoice ID", "Date", "Customer", "Total Amount", "Status"];
    const rows = sales.map(s => [
      s.invoiceNumber,
      format(new Date(s.createdAt), "yyyy-MM-dd HH:mm"),
      s.customerName,
      Math.round(s.totalAmount),
      s.paymentStatus
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sales_history_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: "Invoice ID",
      isMain: true,
      accessor: (sale: any) => (
        <div>
          <div className="font-black text-slate-900 dark:text-white tracking-tight">{sale.invoiceNumber}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
             <User size={10} className="text-primary" /> {sale.userName}
          </div>
        </div>
      )
    },
    {
      header: "Date/Time",
      isMeta: true,
      accessor: (sale: any) => (
        <div>
          <div className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400">{format(new Date(sale.createdAt), "MMM dd, yyyy")}</div>
          <div className="text-[9px] sm:text-[10px] font-medium text-slate-400">{format(new Date(sale.createdAt), "HH:mm")}</div>
        </div>
      )
    },
    {
      header: "Customer Node",
      accessor: (sale: any) => (
        <div>
          <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{sale.customerName}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Retail Client</div>
        </div>
      )
    },
    {
      header: "Total Yield",
      isMeta: true,
      accessor: (sale: any) => (
        <div>
          <div className="text-base sm:text-lg font-[1000] text-slate-900 dark:text-white tracking-tighter">Le {Math.round(sale.totalAmount).toLocaleString()}</div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
             {sale.paymentMethod === 'CASH' ? <Wallet size={10} /> : <SmartphoneIcon size={10} />}
             {sale.paymentMethod}
          </div>
        </div>
      )
    },
    {
      header: "Status",
      accessor: (sale: any) => (
        <div className={cn("inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm", 
          sale.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400")}>
          {sale.paymentStatus}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-10 p-4 sm:p-6 md:p-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <div className={cn("p-1.5 rounded-lg text-white shadow-lg", colors.primary)}>
                 <ShoppingCart className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Commerce Intelligence</span>
           </div>
           <h1 className="text-3xl sm:text-4xl font-[1000] text-slate-900 dark:text-white tracking-tight uppercase italic">Sales <span className="text-primary">History</span></h1>
           <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Audit and track every finalized transaction across your network.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
           <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-800 gap-2 font-black uppercase text-[10px] tracking-widest" onClick={handleExportCSV}>
              <FileDown className="h-4 w-4 text-primary" /> Export CSV Vault
           </Button>
           <Button className={cn("h-14 px-8 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest shadow-xl", colors.primary)} onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" /> Print System Report
           </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl sm:rounded-[2rem]">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="Search invoice or customer..." 
                 className="h-12 sm:h-14 pl-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:bg-white transition-all font-bold text-xs"
                 value={searchQuery}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
               />
            </div>
            <div className="flex gap-2">
               <Select value={filterRange} onValueChange={(val: string | null) => setFilterRange(val ?? "TODAY")}>
                 <SelectTrigger className="h-12 sm:h-14 rounded-2xl w-full md:w-[220px] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-[10px] uppercase tracking-widest text-slate-500 shadow-sm">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                   {ranges.map((r: any) => <SelectItem key={r.value} value={r.value} className="font-bold py-3 uppercase tracking-widest text-[10px]">{r.label}</SelectItem>)}
                 </SelectContent>
               </Select>
            </div>
        </div>
      </Card>

      <ResponsiveTable 
        data={filteredSales}
        columns={columns}
        loading={loading}
        onRowClick={(sale) => {
          setSelectedSale(sale);
          setIsDetailsOpen(true);
        }}
        emptyState={
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
             <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                <Receipt className="h-8 w-8 text-slate-200 dark:text-slate-600" />
             </div>
             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching nodes detected</p>
          </div>
        }
      />

      {/* DETAIL VIEW MODAL */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950">
           <div className="bg-slate-900 p-8 text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                 <Receipt size={180} />
              </div>
              <div className="relative z-10 space-y-1">
                 <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Invoice Intelligence</div>
                 <h3 className="text-3xl font-[1000] tracking-tighter uppercase italic leading-none">{selectedSale?.invoiceNumber}</h3>
                 <div className="flex items-center gap-3 pt-4">
                    <div className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", 
                       selectedSale?.paymentStatus === 'PAID' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white")}>
                       {selectedSale?.paymentStatus}
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-700" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedSale && format(new Date(selectedSale.createdAt), "PPP p")}</span>
                 </div>
              </div>
           </div>

           <div className="p-8 space-y-8 bg-white dark:bg-slate-950 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-2">Line Item Breakdown</h4>
                 <div className="space-y-4">
                    {selectedSale?.items.map((item: any, i: number) => (
                       <div key={i} className="flex justify-between items-start group">
                          <div className="flex-1">
                             <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{item.name}</div>
                             <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                {item.quantity} x Le {Math.round(item.unitPrice).toLocaleString()}
                             </div>
                          </div>
                          <div className="text-sm font-[1000] text-slate-900 dark:text-white tracking-tighter">
                             Le {Math.round(item.total).toLocaleString()}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Transaction Subtotal</span>
                    <span className="text-slate-900 dark:text-white">Le {Math.round(selectedSale?.totalAmount / 1.15).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Tax Applied (15%)</span>
                    <span className="text-slate-900 dark:text-white">Le {Math.round(selectedSale?.totalAmount - (selectedSale?.totalAmount / 1.15)).toLocaleString()}</span>
                 </div>
                 <div className="h-px bg-slate-100 dark:bg-slate-800 w-full my-2" />
                 <div className="flex justify-between items-end pt-2">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Final Settlement</span>
                       <div className="text-4xl font-[1000] text-slate-900 dark:text-white tracking-tighter">Le {Math.round(selectedSale?.totalAmount).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Method</span>
                       <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                          {selectedSale?.paymentMethod === 'CASH' ? <Wallet size={12} className="text-blue-500" /> : <SmartphoneIcon size={12} className="text-emerald-500" />}
                          {selectedSale?.paymentMethod}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 pt-0 flex gap-4 bg-white dark:bg-slate-950 relative z-10">
              <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 border-slate-200 dark:border-slate-800 transition-all flex gap-2" onClick={handlePrint}>
                 <Printer className="h-4 w-4" /> Print Copy
              </Button>
              <Button onClick={() => setIsDetailsOpen(false)} className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-slate-900 text-white hover:bg-slate-800 shadow-xl transition-all">
                 Close View
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
