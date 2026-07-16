"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Search, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { ModuleHeader } from "@/components/layout/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getQuotes, updateQuoteStatus } from "@/lib/actions/quotes";
import { format } from "date-fns";
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

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadQuotes();
  }, []);

  async function loadQuotes() {
    try {
      setLoading(true);
      const res = await getQuotes();
      if (res.success) {
        setQuotes(res.quotes);
      } else {
        toast.error(res.error || "Failed to load quotes");
      }
    } catch (error) {
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(id: string, newStatus: any) {
    try {
      const res = await updateQuoteStatus(id, newStatus);
      if (res.success) {
        toast.success("Quote status updated");
        setQuotes(quotes.map(q => q.id === id ? { ...q, status: newStatus } : q));
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }

  const filteredQuotes = quotes.filter(q => 
    q.reference.toLowerCase().includes(search.toLowerCase()) ||
    q.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED": return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Accepted</Badge>;
      case "SENT": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><Clock className="w-3 h-3 mr-1"/> Sent</Badge>;
      case "REJECTED": return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20"><AlertCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      case "CONVERTED": return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20">Converted</Badge>;
      case "DRAFT": 
      default: return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <ModuleHeader 
        title="Quotes & Estimates" 
        description="Create and manage quotes for your customers before finalizing a sale."
        icon={FileText}
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-1 w-full sm:w-auto items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by quote # or customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
          </div>
        </div>

        <div className="flex w-full sm:w-auto shrink-0 gap-2">
          <Button asChild className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm w-full sm:w-auto gap-2">
            <Link href="/dashboard/sales/quotes/new">
              <Plus className="h-4 w-4" />
              Create Quote
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="border-slate-200 dark:border-slate-800">
              <TableHead className="font-semibold text-slate-500">Quote #</TableHead>
              <TableHead className="font-semibold text-slate-500">Customer</TableHead>
              <TableHead className="font-semibold text-slate-500">Date Created</TableHead>
              <TableHead className="font-semibold text-slate-500">Valid Until</TableHead>
              <TableHead className="font-semibold text-slate-500">Amount</TableHead>
              <TableHead className="font-semibold text-slate-500">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-slate-100 dark:border-slate-800/50">
                  <TableCell colSpan={7} className="h-16 animate-pulse bg-slate-50/50 dark:bg-slate-800/50" />
                </TableRow>
              ))
            ) : filteredQuotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                  No quotes found.
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotes.map((quote) => (
                <TableRow key={quote.id} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    {quote.reference}
                  </TableCell>
                  <TableCell>
                    {quote.customer ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-white">{quote.customer.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Walk-in Customer</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {format(new Date(quote.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {quote.validUntil ? format(new Date(quote.validUntil), "MMM dd, yyyy") : "-"}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    Le {Number(quote.totalAmount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(quote.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    {quote.status === "DRAFT" && (
                      <Button size="sm" variant="outline" className="mr-2 h-8 rounded-lg" onClick={() => handleStatusUpdate(quote.id, "SENT")}>Mark Sent</Button>
                    )}
                    {quote.status === "SENT" && (
                      <>
                        <Button size="sm" variant="outline" className="mr-2 h-8 rounded-lg border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={() => handleStatusUpdate(quote.id, "ACCEPTED")}>Accept</Button>
                        <Button size="sm" variant="outline" className="mr-2 h-8 rounded-lg border-rose-500 text-rose-600 hover:bg-rose-50" onClick={() => handleStatusUpdate(quote.id, "REJECTED")}>Reject</Button>
                      </>
                    )}
                    {quote.status === "ACCEPTED" && (
                      <Button size="sm" className="h-8 rounded-lg bg-indigo-600 text-white" onClick={() => handleStatusUpdate(quote.id, "CONVERTED")}>Convert to Sale</Button>
                    )}
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
