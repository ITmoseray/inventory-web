"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getControlledSubstanceSales } from "@/lib/actions/sale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Download, ShieldAlert, User, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ControlledSubstancesReportPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await getControlledSubstanceSales();
      setSales(data);
    } catch (error) {
      toast.error("Failed to load controlled substance report.");
    } finally {
      setLoading(false);
    }
  }

  const filteredSales = sales.filter(s => 
    s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Controlled Substance Dispensation Log", 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 14, 30);
    
    const tableData = filteredSales.map(sale => [
      format(new Date(sale.createdAt), "MMM dd, yyyy HH:mm"),
      sale.invoiceNumber,
      sale.customerName,
      sale.prescriptionId,
      sale.items.map((i: any) => `${i.name} (x${i.quantity})`).join("\n"),
      sale.userName
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Invoice', 'Patient/Customer', 'Prescription ID', 'Medications Dispensed', 'Pharmacist/User']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    doc.save("controlled_substances_report.pdf");
    toast.success("Report downloaded successfully");
  };

  const columns = [
    {
      header: "Transaction",
      isMain: true,
      accessor: (sale: any) => (
        <div>
           <div className="font-black text-slate-800 dark:text-white text-sm">{sale.invoiceNumber}</div>
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(sale.createdAt), "MMM dd, yyyy • HH:mm")}</div>
        </div>
      )
    },
    {
      header: "Patient / Customer",
      isMeta: true,
      accessor: (sale: any) => (
        <div className="flex flex-col">
           <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{sale.customerName}</span>
           <span className="text-[10px] text-slate-400">{sale.customerPhone}</span>
        </div>
      )
    },
    {
      header: "Prescription ID",
      accessor: (sale: any) => (
        <div className="flex items-center gap-2">
           <FileText className="h-3 w-3 text-indigo-500" />
           <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{sale.prescriptionId}</span>
        </div>
      )
    },
    {
      header: "Medications Dispensed",
      accessor: (sale: any) => (
        <div className="space-y-1">
           {sale.items.map((item: any, idx: number) => (
             <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-black">x{item.quantity}</span>
             </div>
           ))}
        </div>
      )
    },
    {
      header: "Dispensed By",
      accessor: (sale: any) => (
        <div className="flex items-center gap-2">
           <User className="h-3 w-3 text-slate-400" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{sale.userName}</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-10 animate-in fade-in duration-700 pb-20 bg-slate-50/30 dark:bg-slate-950/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-rose-600 text-white shadow-xl shadow-rose-500/20">
                 <ShieldAlert className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">Compliance Report</span>
           </div>
           <h1 className="text-2xl sm:text-3xl font-[1000] text-slate-900 dark:text-white tracking-tighter uppercase italic">Controlled Substances Log</h1>
           <p className="text-sm font-bold text-slate-500 mt-1">Dispensation records for restricted medications.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <Button onClick={exportPDF} className="w-full sm:w-auto rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-transform h-12">
              <Download className="mr-2 h-4 w-4" /> Export PDF
           </Button>
        </div>
      </div>

      <Card className="rounded-[2rem] border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/50">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                 <CardTitle className="text-lg font-black uppercase tracking-tight">Dispensation Ledger</CardTitle>
                 <CardDescription className="text-xs font-bold">Comprehensive log of all restricted drug sales</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <Input 
                   placeholder="Search invoice, patient, or RX ID..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-9 h-12 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-bold"
                 />
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
           {loading ? (
             <div className="p-20 text-center space-y-4 animate-pulse">
                <AlertTriangle className="h-8 w-8 text-rose-300 mx-auto" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Fetching records...</p>
             </div>
           ) : filteredSales.length === 0 ? (
             <div className="p-20 text-center space-y-4">
                <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">No records found</p>
             </div>
           ) : (
             <ResponsiveTable columns={columns} data={filteredSales} />
           )}
        </CardContent>
      </Card>
    </div>
  );
}
