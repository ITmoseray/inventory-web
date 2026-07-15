"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Search, Filter, MoreHorizontal, Eye, Download, Trash, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { ModuleHeader } from "@/components/layout/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInvoices, deleteInvoice } from "@/lib/actions/invoices";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const res = await deleteInvoice(id);
      if (res.success) {
        toast.success("Invoice deleted successfully");
        setInvoices(invoices.filter(inv => inv.id !== id));
      } else {
        toast.error("Failed to delete invoice");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID": return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Paid</Badge>;
      case "PARTIAL": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><Clock className="w-3 h-3 mr-1"/> Partial</Badge>;
      case "OVERDUE": return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20"><AlertCircle className="w-3 h-3 mr-1"/> Overdue</Badge>;
      case "DRAFT": return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20">Draft</Badge>;
      default: return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20">Unpaid</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <ModuleHeader 
        title="Invoices" 
        description="Create and share professional invoices for your B2B customers and wholesale orders."
        icon={FileText}
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-1 w-full sm:w-auto items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by invoice # or customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl">
             <Filter className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
        
        <Link href="/dashboard/sales/invoices/new">
          <Button className="w-full sm:w-auto h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
             <Plus className="h-4 w-4 mr-2" />
             Create Invoice
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Invoice</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Customer</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Date Issued</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Due Date</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-100">Amount</TableHead>
              <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-100">Balance Due</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">Loading invoices...</TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-10 w-10 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No invoices found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    <Link href={`/dashboard/sales/invoices/${invoice.id}`} className="hover:underline">
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {invoice.customer ? (
                       <div className="font-medium text-slate-700 dark:text-slate-300">{invoice.customer.name}</div>
                    ) : (
                       <span className="text-slate-400 italic">Walk-in Customer</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500">{format(new Date(invoice.issueDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-slate-500">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                    Le {Number(invoice.totalAmount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-rose-600">
                    Le {Number(invoice.balanceDue).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                           <Link href={`/dashboard/sales/invoices/${invoice.id}`} className="cursor-pointer">
                             <Eye className="mr-2 h-4 w-4" /> View Invoice
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer" onClick={() => handleDelete(invoice.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
