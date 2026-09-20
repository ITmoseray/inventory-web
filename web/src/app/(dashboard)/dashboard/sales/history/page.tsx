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
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            {copy.titlePrefix} {copy.titleHighlight}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            {copy.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-4"
          >
            <FileDown size={14} className="text-[#2563EB]" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-4"
          >
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* Toolbar: Search and Filter */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            placeholder={`Search ${isBar ? "tab or guest" : "invoice or customer"}...`}
            className="input-field pl-10 w-full text-xs font-medium"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto flex items-center gap-2">
          <select
            value={filterRange}
            onChange={(e) => setFilterRange(e.target.value)}
            className="h-10 px-3.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          >
            {ranges.map((r: any) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">
                  {copy.idLabel}
                </th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">
                  Date / Time
                </th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">
                  {copy.customerLabel}
                </th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">
                  Items
                </th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">
                  Total Yield
                </th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">
                  Method
                </th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td colSpan={8} className="px-4 py-6 text-center">
                      <div className="h-4 bg-[var(--muted)] rounded animate-pulse w-1/3 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[var(--muted-foreground)]">
                    <Receipt size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-sm">{copy.emptyState}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      No transactions found for the selected period.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const isPaid = sale.paymentStatus === "PAID";
                  return (
                    <tr
                      key={sale.id}
                      onClick={() => {
                        setSelectedSale(sale);
                        setIsDetailsOpen(true);
                      }}
                      className="table-row-hover border-b border-[var(--border)] cursor-pointer text-xs"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-[#2563EB]">
                        {sale.invoiceNumber}
                        <div className="text-[10px] font-normal text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                          <User size={10} /> {sale.userName}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[var(--foreground)]">
                        <div className="font-semibold">{format(new Date(sale.createdAt), "MMM dd, yyyy")}</div>
                        <div className="text-[10px] font-mono text-[var(--muted-foreground)]">
                          {format(new Date(sale.createdAt), "HH:mm")}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-[var(--foreground)]">
                        {sale.customerName}
                        <div className="text-[10px] font-normal text-[var(--muted-foreground)]">
                          {copy.customerSub}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[var(--foreground)]">
                        {sale.items?.length ?? 0} item{(sale.items?.length ?? 0) !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-extrabold text-sm text-[var(--foreground)]">
                        Le {Math.round(sale.totalAmount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--muted-foreground)]">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--muted)] text-[10.5px] font-medium">
                          {sale.paymentMethod === "CASH" ? <Wallet size={11} /> : <SmartphoneIcon size={11} />}
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="status-badge"
                          style={{
                            background: isPaid ? "#DCFCE7" : "#FEF3C7",
                            color: isPaid ? "#15803D" : "#D97706",
                          }}
                        >
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="p-1 rounded text-[var(--muted-foreground)] hover:text-[#2563EB] inline-block">
                          <ChevronRight size={14} />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL VIEW MODAL */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-2xl border border-[var(--border)] shadow-2xl p-0 overflow-hidden bg-[var(--card)]">
           <div className="bg-[#0B1629] p-6 text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                 <Receipt size={140} />
              </div>
              <div className="relative z-10 space-y-1">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">{copy.modalIntel}</div>
                 <h3 className="text-2xl font-extrabold tracking-tight font-display">{selectedSale?.invoiceNumber}</h3>
                 <div className="flex items-center gap-3 pt-3">
                    <span className="status-badge" style={{
                       background: selectedSale?.paymentStatus === 'PAID' ? "#DCFCE7" : "#FEF3C7",
                       color: selectedSale?.paymentStatus === 'PAID' ? "#15803D" : "#D97706"
                    }}>
                       {selectedSale?.paymentStatus}
                    </span>
                    <span className="text-xs text-[#94A3B8] font-mono">{selectedSale && format(new Date(selectedSale.createdAt), "PPP p")}</span>
                 </div>
              </div>
           </div>

           <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                 <h4 className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">Line Item Breakdown</h4>
                 <div className="space-y-3">
                    {selectedSale?.items.map((item: any, i: number) => (
                       <div key={i} className="flex justify-between items-start">
                          <div className="flex-1">
                             <div className="text-xs font-semibold text-[var(--foreground)]">{item.name}</div>
                             <div className="text-[10px] text-[var(--muted-foreground)] font-mono">
                                {item.quantity} x Le {Math.round(item.unitPrice).toLocaleString()}
                             </div>
                          </div>
                          <div className="text-xs font-mono font-bold text-[var(--foreground)]">
                             Le {Math.round(item.total).toLocaleString()}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] space-y-2 text-xs">
                 <div className="flex justify-between text-[var(--muted-foreground)]">
                    <span>Transaction Subtotal</span>
                    <span className="text-[var(--foreground)] font-mono font-semibold">Le {Math.round(selectedSale?.totalAmount || 0).toLocaleString()}</span>
                 </div>
                 {Number(selectedSale?.tax) > 0 && (
                   <div className="flex justify-between text-[var(--muted-foreground)]">
                      <span>Tax Amount</span>
                      <span className="text-[var(--foreground)] font-mono">Le {Math.round(Number(selectedSale.tax)).toLocaleString()}</span>
                   </div>
                 )}
                 <div className="h-px bg-[var(--border)] w-full my-2" />
                 <div className="flex justify-between items-end pt-1">
                    <div>
                       <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">Final Settlement</span>
                       <div className="text-2xl font-extrabold font-mono text-[var(--foreground)] tracking-tight">Le {Math.round(selectedSale?.totalAmount).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-medium text-[var(--muted-foreground)] block">Method</span>
                       <div className="px-2.5 py-1 rounded bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)] inline-flex items-center gap-1.5 mt-0.5">
                          {selectedSale?.paymentMethod === 'CASH' ? <Wallet size={12} className="text-[#2563EB]" /> : <SmartphoneIcon size={12} className="text-[#10B981]" />}
                          {selectedSale?.paymentMethod}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-6 pt-0 flex gap-3">
              <button onClick={handlePrint} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-2.5">
                 <Printer size={14} /> Print Copy
              </button>
              <button onClick={() => setIsDetailsOpen(false)} className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-2.5">
                 Close View
              </button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
