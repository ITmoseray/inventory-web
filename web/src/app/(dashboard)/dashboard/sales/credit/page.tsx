"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Clock, 
  User, 
  Wallet,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Receipt
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDebts, createDebtPayment } from "@/lib/actions/debt";
import { format } from "date-fns";
import { cn, getIndustryColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function CreditSalesPage() {
  const { data: session } = useSession();
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Payment Dialog State
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNote, setPaymentNote] = useState("");

  const businessType = session?.user?.businessType || "SHOP";
  const colors = getIndustryColor(businessType);

  useEffect(() => {
    fetchDebts();
  }, []);

  async function fetchDebts() {
    try {
      setLoading(true);
      const data = await getDebts();
      setDebts(data);
    } catch (error) {
      toast.error("Failed to sync debt ledger.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment() {
    if (!selectedDebt) return;
    if (paymentAmount <= 0) return toast.error("Enter a valid amount");
    if (paymentAmount > (selectedDebt.totalAmount - selectedDebt.paidAmount)) {
       return toast.error("Payment exceeds outstanding balance");
    }

    try {
      const result = await createDebtPayment(selectedDebt.id, paymentAmount, "CASH", paymentNote);
      if (result.success) {
        toast.success("Payment recorded successfully.");
        setIsPaymentDialogOpen(false);
        setPaymentAmount(0);
        setPaymentNote("");
        fetchDebts();
      } else {
        toast.error("Failed to record payment.");
      }
    } catch (error) {
      toast.error("Failed to record payment.");
    }
  }

  const filteredDebts = debts.filter(d => 
    d.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.sale?.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOutstanding = debts.reduce((sum, d) => sum + (Number(d.totalAmount) - Number(d.paidAmount)), 0);
  const totalPaid = debts.reduce((sum, d) => sum + Number(d.paidAmount), 0);
  const activeDebtors = debts.filter(d => d.status !== 'PAID').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Credit Sales & Receivables
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Track customer liabilities, credit balances, and debt recovery
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="kpi-card">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Total Outstanding</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#EF4444]/10 text-[#EF4444]">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-[#EF4444] tracking-tight">
            Le {Math.round(totalOutstanding).toLocaleString()}
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Total Collected</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#10B981]/10 text-[#10B981]">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-[#10B981] tracking-tight">
            Le {Math.round(totalPaid).toLocaleString()}
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Active Debtors</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F59E0B]/10 text-[#F59E0B]">
              <User size={16} />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
            {activeDebtors}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            placeholder="Search debtor or invoice #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 w-full text-xs font-medium"
          />
        </div>
      </div>

      {/* Debts Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Debtor Identity</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Total Liability</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Current Balance</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Cycle Status</th>
                <th className="text-right text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td colSpan={5} className="px-4 py-6 text-center">
                      <div className="h-4 bg-[var(--muted)] rounded animate-pulse w-1/3 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredDebts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[var(--muted-foreground)]">
                    <Receipt size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-sm">Clear Ledger Detected</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">No outstanding debt records found.</p>
                  </td>
                </tr>
              ) : (
                filteredDebts.map((debt) => (
                  <tr key={debt.id} className="table-row-hover border-b border-[var(--border)] text-xs">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[var(--foreground)]">{debt.customer?.name}</div>
                      <div className="text-[10px] font-mono text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                        <Receipt size={10} className="text-[#2563EB]" /> {debt.sale?.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-semibold text-[var(--foreground)]">Le {Math.round(debt.totalAmount).toLocaleString()}</div>
                      <div className="text-[10px] font-mono text-[var(--muted-foreground)]">{format(new Date(debt.createdAt), "MMM dd, yyyy")}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-extrabold text-sm text-[#EF4444]">
                        Le {Math.round(debt.totalAmount - debt.paidAmount).toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-[#10B981] font-semibold">
                        Le {Math.round(debt.paidAmount).toLocaleString()} Paid
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="status-badge"
                        style={{
                          background: debt.status === 'PAID' ? "#DCFCE7" : "#FEE2E2",
                          color: debt.status === 'PAID' ? "#15803D" : "#DC2626",
                        }}
                      >
                        {debt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {debt.status !== 'PAID' && (
                        <button
                          className="btn-secondary text-xs font-semibold py-1.5 px-3"
                          onClick={() => {
                            setSelectedDebt(debt);
                            setPaymentAmount(debt.totalAmount - debt.paidAmount);
                            setIsPaymentDialogOpen(true);
                          }}
                        >
                          Settle <ChevronRight size={12} className="inline ml-1" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold font-display">Record Settlement</DialogTitle>
            <DialogDescription className="text-xs text-[var(--muted-foreground)]">
              Recording payment for {selectedDebt?.customer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--muted-foreground)] block">Payment Amount (Le)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="input-field w-full text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--muted-foreground)] block">Payment Note</label>
              <input
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="input-field w-full text-xs"
                placeholder="Optional note..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button className="btn-secondary py-2 px-4 text-xs font-semibold" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary py-2 px-4 text-xs font-semibold" onClick={handlePayment}>
              Confirm Payment
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
