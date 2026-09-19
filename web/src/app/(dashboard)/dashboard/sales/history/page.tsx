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
import { EnterprisePageHeader, EnterpriseBadge, PaymentStatusBadge, EnterpriseEmptyState } from "@/components/enterprise";

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
  const isBar = businessType === "BAR";

  const copy = {
    titlePrefix: isBar ? "Tab" : "Sales",
    titleHighlight: isBar ? "History" : "History",
    subtitle: isBar ? "Audit and track every closed tab and order across your bar." : "Audit and track every finalized transaction across your network.",
    intelligence: isBar ? "Bar Intelligence" : "Commerce Intelligence",
    idLabel: isBar ? "Tab ID" : "Invoice ID",
    customerLabel: isBar ? "Guest/Table" : "Customer Node",
    customerSub: isBar ? "Bar Guest" : "Retail Client",
    emptyState: isBar ? "No closed tabs detected" : "No matching nodes detected",
    modalIntel: isBar ? "Tab Intelligence" : "Invoice Intelligence",
  };

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
    const headers = [copy.idLabel, "Date", "Customer", "Total Amount", "Status"];
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
      header: copy.idLabel,
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
      header: copy.customerLabel,
      accessor: (sale: any) => (
        <div>
          <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{sale.customerName}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{copy.customerSub}</div>
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
        <PaymentStatusBadge status={sale.paymentStatus} />
      )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-20">
      <EnterprisePageHeader
        title={`${copy.titlePrefix} ${copy.titleHighlight}`}
        subtitle={copy.subtitle}
        badge={
          <EnterpriseBadge variant="primary" size="sm">
            <ShoppingCart className="h-3 w-3 mr-1" /> {copy.intelligence}
          </EnterpriseBadge>
        }
        actions={
          <div className="flex flex-col sm:flex-row gap-2.5 w-full xl:w-auto">
            <Button variant="outline" className="h-11 px-5 rounded-2xl border-slate-200 dark:border-slate-800 gap-2 font-bold text-xs" onClick={handleExportCSV}>
              <FileDown className="h-4 w-4 text-primary" /> Export CSV
            </Button>
            <Button className={cn("h-11 px-5 rounded-2xl text-white font-bold text-xs shadow-md", colors.primary)} onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" /> Print Report
            </Button>
          </div>
        }
      />

      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder={`Search ${isBar ? "tab or guest" : "invoice or customer"}...`} 
                 className="h-12 pl-11 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 focus:bg-white transition-all font-bold text-xs"
                 value={searchQuery}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
               />
            </div>
            <div className="flex gap-2">
               <Select value={filterRange} onValueChange={(val: string | null) => setFilterRange(val ?? "TODAY")}>
                 <SelectTrigger className="h-12 rounded-2xl w-full md:w-[220px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs text-slate-700 dark:text-slate-300 shadow-sm">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                   {ranges.map((r: any) => <SelectItem key={r.value} value={r.value} className="font-bold py-2.5 text-xs">{r.label}</SelectItem>)}
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
          <EnterpriseEmptyState
            title={copy.emptyState}
            description="No transactions found for the selected time range. Try selecting a broader period or changing search keywords."
            icon={Receipt}
          />
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
                 <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{copy.modalIntel}</div>
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
                    <span className="text-slate-900 dark:text-white font-black">Le {Math.round(selectedSale?.totalAmount || 0).toLocaleString()}</span>
                 </div>
                 {Number(selectedSale?.tax) > 0 && (
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>Tax Amount</span>
                      <span className="text-slate-900 dark:text-white">Le {Math.round(Number(selectedSale.tax)).toLocaleString()}</span>
                   </div>
                 )}
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
