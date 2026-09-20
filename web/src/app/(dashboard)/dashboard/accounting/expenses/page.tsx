"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Search, 
  Filter, 
  Plus, 
  TrendingDown, 
  Calendar, 
  User,
  History,
  FileText,
  DollarSign,
  ArrowRight
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getExpenses, createExpense } from "@/lib/actions/expense";
import { getTags } from "@/lib/actions/tags";
import { uploadReceipt } from "@/lib/actions/upload";
import { ImageUploader } from "@/components/ui/image-uploader";
import { format } from "date-fns";
import { cn, getIndustryColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function ExpensesPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "General",
    paymentMethod: "CASH",
    attachments: [] as string[],
    tags: [] as string[]
  });

  const businessType = session?.user?.businessType || "SHOP";
  const colors = getIndustryColor(businessType);

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      setLoading(true);
      const [data, tagsData] = await Promise.all([getExpenses(), getTags()]);
      setExpenses(data);
      setTags(tagsData?.tags || []);
    } catch (error) {
      toast.error("Failed to load expense ledger.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success("Expense recorded successfully.");
      setIsDialogOpen(false);
      setFormData({ description: "", amount: "", category: "General", paymentMethod: "CASH", attachments: [], tags: [] });
      fetchExpenses();
    } catch (error) {
      toast.error("Failed to record expense.");
    }
  }

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-rose-500 text-white shadow-sm">
              <TrendingDown className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Expenditure Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Business Expenses
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track and reconcile operational expenditures, overhead, supplier payouts, and receipts.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 rounded-lg font-semibold text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" /> Log New Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-[520px] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 bg-white dark:bg-[#0F1E38] max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Record Expense
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Description *</Label>
                <Input 
                  required 
                  placeholder="e.g. Monthly Rent, Electricity, Packaging..." 
                  className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => {
                        if (formData.tags.includes(t.id)) {
                          setFormData({ ...formData, tags: formData.tags.filter(id => id !== t.id) });
                        } else {
                          setFormData({ ...formData, tags: [...formData.tags, t.id] });
                        }
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer border transition-all",
                        formData.tags.includes(t.id) 
                          ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-blue-400" 
                          : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      {t.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Amount (Le) *</Label>
                  <Input 
                    required 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 font-mono"
                    value={formData.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Category</Label>
                  <Select value={formData.category} onValueChange={(v: string | null) => setFormData({...formData, category: v ?? "General"})}>
                    <SelectTrigger className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                      <SelectItem value="Rent">Rent</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Salaries">Salaries</SelectItem>
                      <SelectItem value="Inventory">Inventory</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Receipt Attachment</Label>
                <ImageUploader 
                  uploadAction={async (fd) => {
                    const url = await uploadReceipt(fd);
                    if (url) {
                      setFormData({ ...formData, attachments: [...formData.attachments, url] });
                    }
                    return url;
                  }} 
                  label="Upload Receipt Document" 
                />
                {formData.attachments.length > 0 && (
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    ✓ {formData.attachments.length} receipt attachment(s) added
                  </div>
                )}
              </div>
              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 h-9 rounded-lg font-medium text-xs border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-9 rounded-lg text-white font-semibold text-xs bg-[#2563EB] hover:bg-[#1D4ED8]"
                >
                  Save Expense
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Monthly Spend</p>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tracking-tight truncate mt-0.5">
              Le {Math.round(expenses.reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-[#2563EB] shrink-0">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Recorded Expenses</p>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tracking-tight truncate mt-0.5">
              {expenses.length} entries
            </p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 shrink-0">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Expense Intensity</p>
            <p className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight truncate mt-0.5">
              Normal
            </p>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input 
              placeholder="Search expenses by description or category..." 
              className="h-9 pl-9 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">{filteredExpenses.length} entries matching</span>
        </div>
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[600px]">
            <TableHeader className="bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800">
              <TableRow className="border-none">
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-400 pl-5">Description</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-400">Category</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-400">Amount</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 dark:text-slate-400 text-right pr-5">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="h-16 border-b border-slate-100 dark:border-slate-800 animate-pulse">
                    <TableCell colSpan={4} />
                  </TableRow>
                ))
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="space-y-2">
                      <History className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-slate-400 text-xs font-medium">No expenses found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((e) => (
                  <TableRow key={e.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800">
                    <TableCell className="pl-5 py-3">
                      <div className="font-medium text-xs text-slate-900 dark:text-white">{e.description}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <User size={10} className="text-[#2563EB]" /> {e.userName || "Admin"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {e.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400">
                        Le {Math.round(e.amount).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span>{e.paymentMethod}</span>
                        {e.attachments && e.attachments.length > 0 && (
                          <a href={e.attachments[0]} target="_blank" rel="noreferrer" className="text-[#2563EB] hover:underline flex items-center gap-1">
                            <FileText size={10} /> View Receipt
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-5 text-xs text-slate-500 dark:text-slate-400">
                      {format(new Date(e.date), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
