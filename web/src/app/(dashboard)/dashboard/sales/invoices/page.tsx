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
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; invoiceNumber: string }>({
    open: false,
    id: "",
    invoiceNumber: "",
  });

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
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Invoices
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Create and track professional B2B invoices and customer billing records
          </p>
        </div>
        <Link href="/dashboard/sales/invoices/new">
          <button className="btn-primary flex items-center gap-2 text-xs font-semibold py-2.5 px-5">
            <Plus size={15} /> Create Invoice
          </button>
        </Link>
      </div>

      {/* Toolbar: Search */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            placeholder="Search by invoice # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full text-xs font-medium"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Invoice</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Customer</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Date Issued</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Due Date</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Status</th>
                <th className="text-right text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Amount</th>
                <th className="text-right text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Balance Due</th>
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
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[var(--muted-foreground)]">
                    <FileText size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-sm">No invoices found</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      Create your first invoice to start tracking receivables.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="table-row-hover border-b border-[var(--border)] text-xs group"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-[#2563EB]">
                      <Link href={`/dashboard/sales/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[var(--foreground)]">
                      {invoice.customer ? (
                        invoice.customer.name
                      ) : (
                        <span className="text-[var(--muted-foreground)] italic">Walk-in Customer</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[var(--muted-foreground)]">
                      {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[var(--muted-foreground)]">
                      {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-extrabold text-sm text-[var(--foreground)]">
                      Le {Number(invoice.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-[#EF4444]">
                      Le {Number(invoice.balanceDue).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[#2563EB] hover:bg-[var(--muted)] transition-all">
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl border border-[var(--border)] shadow-xl bg-[var(--card)]">
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/sales/invoices/${invoice.id}`} className="cursor-pointer text-xs font-medium flex items-center gap-2">
                              <Eye size={14} /> View Invoice
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-700 cursor-pointer text-xs font-medium flex items-center gap-2"
                            onClick={() => setDeleteModal({ open: true, id: invoice.id, invoiceNumber: invoice.invoiceNumber })}
                          >
                            <Trash size={14} /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, open }))}
        title="Delete Sales Invoice"
        description={
          <>
            Are you sure you want to delete invoice{" "}
            <code className="text-rose-600 dark:text-rose-400 font-mono text-[11px] bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
              {deleteModal.invoiceNumber}
            </code>
            ?
          </>
        }
        confirmLabel="Delete Invoice"
        loadingLabel="Deleting…"
        warningNote="This invoice and all its itemized billing records will be permanently removed from the ledger."
        onConfirm={() => handleDelete(deleteModal.id)}
      />
    </div>
  );
}
