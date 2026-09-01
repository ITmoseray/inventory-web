"use client";

import { useState, useEffect } from "react";
import { 
  Building2, Plus, Search, Filter, Download, Trash2, Edit3, 
  Calendar, FileText, CheckCircle2, AlertCircle, Clock, 
  Receipt, DollarSign, Percent, ShieldCheck, Scale, CreditCard,
  Building, RefreshCw, X, ArrowUpRight, Check, Printer
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  getTaxRecords, 
  getTaxAnalytics, 
  createTaxRecord, 
  updateTaxRecord, 
  deleteTaxRecord 
} from "@/lib/actions/tax";
import { getCurrentBusiness } from "@/lib/actions/business";

const TAX_TYPES = [
  { id: "ALL", label: "All Taxes", icon: Scale, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  { id: "GST_15", label: "NRA GST (15%)", icon: Receipt, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400" },
  { id: "PAYE_PAYROLL", label: "PAYE (Payroll)", icon: Building, color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400" },
  { id: "WITHHOLDING_TAX", label: "Withholding Tax (WHT)", icon: Percent, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  { id: "CORPORATE_INCOME_TAX", label: "Corporate Income Tax", icon: DollarSign, color: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400" },
  { id: "CITY_COUNCIL_RATES", label: "City Council / Municipal", icon: Building2, color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" },
  { id: "CUSTOMS_DUTY", label: "Customs & Port Duties", icon: ArrowUpRight, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400" },
  { id: "TRADE_LICENSE", label: "Trade & Operating License", icon: FileText, color: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400" },
  { id: "OTHER", label: "Other Taxes & Levies", icon: Scale, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" }
];

const TAX_PRESETS = [
  {
    type: "GST_15",
    name: "NRA 15% Monthly GST Return",
    authority: "National Revenue Authority (NRA)",
    rate: 15,
    description: "Standard Sierra Leone Goods and Services Tax"
  },
  {
    type: "PAYE_PAYROLL",
    name: "Staff PAYE Remittance",
    authority: "National Revenue Authority (NRA)",
    rate: 0,
    description: "Employee Pay-As-You-Earn payroll withholding"
  },
  {
    type: "WITHHOLDING_TAX",
    name: "Withholding Tax (WHT 5.5% Goods/Services)",
    authority: "National Revenue Authority (NRA)",
    rate: 5.5,
    description: "Standard WHT on contracts & vendor supplies"
  },
  {
    type: "WITHHOLDING_TAX",
    name: "Withholding Tax (WHT 10% Rent/Lease)",
    authority: "National Revenue Authority (NRA)",
    rate: 10,
    description: "Withholding tax deducted on commercial property rent"
  },
  {
    type: "CITY_COUNCIL_RATES",
    name: "Municipal Property & Trade Rate",
    authority: "Freetown City Council (FCC)",
    rate: 0,
    description: "Local government municipal operating rate"
  },
  {
    type: "CUSTOMS_DUTY",
    name: "Port Customs Clearance & ECOWAS Duty",
    authority: "NRA Customs & Excise",
    rate: 0,
    description: "Wharfage and import duties on inventory shipment"
  }
];

export default function TaxesPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    taxType: "GST_15",
    taxName: "NRA 15% Monthly GST Return",
    taxAuthority: "National Revenue Authority (NRA)",
    taxPeriod: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    taxableAmount: "",
    taxRate: "15",
    taxAmount: "",
    paidAmount: "",
    paymentStatus: "PAID",
    paymentDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    paymentMethod: "BANK_TRANSFER",
    referenceNumber: "",
    tinNumber: "",
    notes: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [recData, anaData, bData] = await Promise.all([
        getTaxRecords({
          taxType: selectedType,
          paymentStatus: selectedStatus,
          search: searchQuery
        }),
        getTaxAnalytics(),
        getCurrentBusiness()
      ]);
      setRecords(recData);
      setAnalytics(anaData);
      setBusiness(bData);
    } catch (err) {
      console.error("Failed to load taxes", err);
      toast.error("Failed to fetch tax records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedType, selectedStatus, searchQuery]);

  const handleOpenAdd = (preset?: any) => {
    setEditingRecord(null);
    const rawSettings = (business?.receiptSettings as any) || {};
    const defaultTin = rawSettings.taxIdentificationNumber || business?.taxId || "1002934-8";

    if (preset) {
      setFormData({
        taxType: preset.type,
        taxName: preset.name,
        taxAuthority: preset.authority,
        taxPeriod: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        taxableAmount: "",
        taxRate: preset.rate ? String(preset.rate) : "0",
        taxAmount: "",
        paidAmount: "",
        paymentStatus: "PAID",
        paymentDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        paymentMethod: "BANK_TRANSFER",
        referenceNumber: "",
        tinNumber: defaultTin,
        notes: ""
      });
    } else {
      setFormData({
        taxType: "GST_15",
        taxName: "NRA 15% Monthly GST Return",
        taxAuthority: "National Revenue Authority (NRA)",
        taxPeriod: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        taxableAmount: "",
        taxRate: "15",
        taxAmount: "",
        paidAmount: "",
        paymentStatus: "PAID",
        paymentDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        paymentMethod: "BANK_TRANSFER",
        referenceNumber: "",
        tinNumber: defaultTin,
        notes: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: any) => {
    setEditingRecord(rec);
    setFormData({
      taxType: rec.taxType || "GST_15",
      taxName: rec.taxName || "",
      taxAuthority: rec.taxAuthority || "National Revenue Authority (NRA)",
      taxPeriod: rec.taxPeriod || "",
      taxableAmount: rec.taxableAmount ? String(rec.taxableAmount) : "",
      taxRate: rec.taxRate ? String(rec.taxRate) : "0",
      taxAmount: String(rec.taxAmount || 0),
      paidAmount: String(rec.paidAmount || 0),
      paymentStatus: rec.paymentStatus || "PAID",
      paymentDate: rec.paymentDate ? rec.paymentDate.slice(0, 10) : "",
      dueDate: rec.dueDate ? rec.dueDate.slice(0, 10) : "",
      paymentMethod: rec.paymentMethod || "BANK_TRANSFER",
      referenceNumber: rec.referenceNumber || "",
      tinNumber: rec.tinNumber || "",
      notes: rec.notes || ""
    });
    setIsModalOpen(true);
  };

  // Auto calculate tax amount based on base & rate
  const handleBaseOrRateChange = (baseStr: string, rateStr: string) => {
    const base = parseFloat(baseStr) || 0;
    const rate = parseFloat(rateStr) || 0;
    if (base > 0 && rate > 0) {
      const calc = (base * (rate / 100));
      setFormData(prev => ({
        ...prev,
        taxableAmount: baseStr,
        taxRate: rateStr,
        taxAmount: calc.toFixed(2),
        paidAmount: prev.paymentStatus === "PAID" ? calc.toFixed(2) : prev.paidAmount
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        taxableAmount: baseStr,
        taxRate: rateStr
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.taxName || !formData.taxPeriod || !formData.taxAmount) {
      toast.error("Please provide tax name, period, and tax amount");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        taxType: formData.taxType,
        taxName: formData.taxName,
        taxAuthority: formData.taxAuthority,
        taxPeriod: formData.taxPeriod,
        taxableAmount: parseFloat(formData.taxableAmount) || 0,
        taxRate: parseFloat(formData.taxRate) || 0,
        taxAmount: parseFloat(formData.taxAmount) || 0,
        paidAmount: parseFloat(formData.paidAmount) || 0,
        paymentStatus: formData.paymentStatus,
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate) : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber,
        tinNumber: formData.tinNumber,
        notes: formData.notes
      };

      if (editingRecord) {
        await updateTaxRecord(editingRecord.id, payload);
        toast.success("Tax record updated successfully");
      } else {
        await createTaxRecord(payload);
        toast.success("Tax record registered successfully");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save tax record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this tax record?")) return;
    try {
      setDeletingId(id);
      await deleteTaxRecord(id);
      toast.success("Tax record removed");
      loadData();
    } catch (err: any) {
      toast.error("Failed to delete record");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-10 animate-in fade-in duration-500 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Scale className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Finance &amp; Statutory Compliance
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-[1000] text-slate-900 dark:text-white tracking-tight uppercase italic">
            Tax Records &amp; <span className="text-indigo-600">NRA Filing</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs mt-1">
            Track GST, PAYE payroll deductions, Withholding Taxes (WHT), City Council rates, and customs duties.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-12 px-5 rounded-2xl border-slate-200 dark:border-slate-800 font-black uppercase text-[10px] tracking-widest gap-2 bg-white dark:bg-slate-900 cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
          >
            <Printer className="h-4 w-4 text-slate-600 dark:text-slate-400" /> Export Tax Ledger
          </Button>

          <Button
            onClick={() => handleOpenAdd()}
            className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-indigo-600/30 cursor-pointer hover:scale-[1.02] transition-all"
          >
            <Plus className="h-4 w-4" /> Record Tax Filing / Payment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Taxes Remitted</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-[1000] tracking-tight text-slate-900 dark:text-white">
            Le {Math.round(analytics?.totalTaxesPaid || 0).toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-2">
            {analytics?.recordCount || 0} Total Tax Filings Settled
          </p>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Liabilities</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-[1000] tracking-tight text-slate-900 dark:text-white">
            Le {Math.round(analytics?.totalPendingLiabilities || 0).toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mt-2">
            Due for statutory settlement
          </p>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sales GST (15%) Assessed</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-[1000] tracking-tight text-indigo-600">
            Le {Math.round(analytics?.estimatedSalesGst || 0).toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">
            Derived from Le {Math.round(analytics?.grossSalesRevenue || 0).toLocaleString()} sales
          </p>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-sm bg-gradient-to-br from-indigo-900 to-slate-950 text-white p-6">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Statutory Tax Calendar</span>
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-black tracking-tight mt-1">
            Monthly NRA Return
          </p>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mt-2">
            Due 15th of Every Month (GST &amp; PAYE)
          </p>
        </Card>
      </div>

      {/* Quick Filing Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            ⚡ Quick Tax Presets (Sierra Leone &amp; NRA Standard)
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Click to Record</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {TAX_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleOpenAdd(p)}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-left transition-all group cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  {p.rate ? `${p.rate}%` : "Tax"}
                </span>
                <Plus className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600">
                {p.name}
              </p>
              <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{p.authority}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        {/* Tax Type Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TAX_TYPES.map((t) => {
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer",
                  isSelected 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-105" 
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by tax name, authority, period, TIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 rounded-xl border-none bg-slate-50 dark:bg-slate-800/60 text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
            {["ALL", "PAID", "PARTIAL", "PENDING"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  selectedStatus === st
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tax Records Table */}
      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 dark:bg-slate-950/50">
                <th className="py-4 px-6">Tax Description</th>
                <th className="py-4 px-4">Period</th>
                <th className="py-4 px-4">Taxable Base &amp; Rate</th>
                <th className="py-4 px-4 text-right">Tax Assessed</th>
                <th className="py-4 px-4 text-right">Amount Paid</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4">Payment Ref / Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Synchronizing tax ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Scale className="h-7 w-7" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-black">No Tax Records Found</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Start recording tax remittances (GST, PAYE, WHT, City Rates) to maintain a complete compliance trail.
                      </p>
                      <Button
                        onClick={() => handleOpenAdd()}
                        className="h-10 px-5 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider mt-2"
                      >
                        + Record First Tax
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const typeObj = TAX_TYPES.find(t => t.id === rec.taxType) || TAX_TYPES[TAX_TYPES.length - 1];
                  const isPaid = rec.paymentStatus === "PAID";
                  const isPartial = rec.paymentStatus === "PARTIAL";

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl text-xs font-bold shrink-0", typeObj.color)}>
                            <typeObj.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">
                              {rec.taxName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {rec.taxAuthority} {rec.tinNumber ? `• TIN: ${rec.tinNumber}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {rec.taxPeriod}
                      </td>

                      <td className="py-4 px-4">
                        {rec.taxableAmount > 0 ? (
                          <div>
                            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              Le {rec.taxableAmount.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              @ {rec.taxRate}% Rate
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Direct assessment</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right font-black font-mono text-slate-900 dark:text-white">
                        Le {rec.taxAmount.toLocaleString()}
                      </td>

                      <td className="py-4 px-4 text-right font-black font-mono text-emerald-600 dark:text-emerald-400">
                        Le {rec.paidAmount.toLocaleString()}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1",
                          isPaid 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" 
                            : isPartial 
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" 
                            : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                        )}>
                          {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {rec.paymentStatus}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">
                          {rec.referenceNumber || rec.paymentMethod}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {rec.paymentDate ? new Date(rec.paymentDate).toLocaleDateString() : "-"}
                        </p>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rec)}
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                            title="Edit Tax Record"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rec.id)}
                            disabled={deletingId === rec.id}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Delete Tax Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record / Edit Tax Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-[2rem] border-none shadow-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Scale className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Tax &amp; Statutory Filing</span>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {editingRecord ? "Edit Tax Record" : "Record Tax Filing / Remittance"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Enter official tax return details and proof of settlement
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Tax Type Selector */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tax Type Category</Label>
              <select
                value={formData.taxType}
                onChange={(e) => {
                  const val = e.target.value;
                  const matchingPreset = TAX_PRESETS.find(p => p.type === val);
                  setFormData(prev => ({
                    ...prev,
                    taxType: val,
                    taxName: matchingPreset ? matchingPreset.name : prev.taxName,
                    taxAuthority: matchingPreset ? matchingPreset.authority : prev.taxAuthority,
                    taxRate: matchingPreset && matchingPreset.rate ? String(matchingPreset.rate) : prev.taxRate
                  }));
                }}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs cursor-pointer"
              >
                {TAX_TYPES.filter(t => t.id !== "ALL").map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tax Name */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tax / Return Name *</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. NRA 15% Monthly GST Return"
                  value={formData.taxName}
                  onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold"
                />
              </div>

              {/* Tax Authority */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Revenue Authority / Body</Label>
                <Input
                  type="text"
                  placeholder="e.g. National Revenue Authority (NRA)"
                  value={formData.taxAuthority}
                  onChange={(e) => setFormData({ ...formData, taxAuthority: e.target.value })}
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tax Period */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tax Period / Month / Year *</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. August 2026 or FY 2025/2026"
                  value={formData.taxPeriod}
                  onChange={(e) => setFormData({ ...formData, taxPeriod: e.target.value })}
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold"
                />
              </div>

              {/* Taxpayer TIN */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Taxpayer TIN Number</Label>
                <Input
                  type="text"
                  placeholder="e.g. 1002934-8"
                  value={formData.tinNumber}
                  onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Calculations Box */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1">
                <span>Tax Assessment Breakdown</span>
                <span className="text-indigo-600">Auto-calculated</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">Taxable Base Amount (Le)</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g. 150000"
                    value={formData.taxableAmount}
                    onChange={(e) => handleBaseOrRateChange(e.target.value, formData.taxRate)}
                    className="h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-mono text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-bold uppercase text-slate-500">Tax Rate (%)</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="15"
                    value={formData.taxRate}
                    onChange={(e) => handleBaseOrRateChange(formData.taxableAmount, e.target.value)}
                    className="h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase text-indigo-600">Total Tax Assessed (Le) *</Label>
                  <Input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.taxAmount}
                    onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                    className="h-10 rounded-xl bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/60 font-mono text-xs font-black text-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase text-emerald-600">Amount Paid / Remitted (Le) *</Label>
                  <Input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.paidAmount}
                    onChange={(e) => {
                      const paid = parseFloat(e.target.value) || 0;
                      const assessed = parseFloat(formData.taxAmount) || 0;
                      let status = "PAID";
                      if (paid <= 0) status = "PENDING";
                      else if (paid < assessed) status = "PARTIAL";
                      setFormData({ ...formData, paidAmount: e.target.value, paymentStatus: status });
                    }}
                    className="h-10 rounded-xl bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/60 font-mono text-xs font-black text-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Status & Method */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</Label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs cursor-pointer"
                >
                  <option value="PAID">PAID (Settled)</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="PENDING">PENDING (Unpaid)</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payment Channel</Label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs cursor-pointer"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque / Draft</option>
                  <option value="CASH">Cash Deposit</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="AFRIMONEY">AfriMoney</option>
                  <option value="DIRECT_DEBIT">Direct Debit</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reference / Receipt #</Label>
                <Input
                  type="text"
                  placeholder="e.g. NRA-REC-89210"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payment Date</Label>
                <Input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filing Deadline / Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Compliance Notes</Label>
              <Textarea
                rows={2}
                placeholder="Optional notes, assessment serials, or remarks..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="rounded-xl border-slate-200 dark:border-slate-800 text-xs resize-none font-medium"
              />
            </div>

            {/* Submit Actions */}
            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 cursor-pointer"
              >
                {isSubmitting ? "Saving..." : editingRecord ? "Update Record" : "Save Tax Record"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
