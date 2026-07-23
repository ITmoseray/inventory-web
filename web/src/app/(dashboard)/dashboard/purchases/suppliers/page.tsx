"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Search, ChevronRight, Pencil, Trash2, Phone, Mail, MapPin,
  Wallet, TrendingUp, AlertTriangle, Building2, MoreVertical, Eye,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "@/lib/actions/supplier";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const PAYMENT_TERMS = ["Net 7", "Net 15", "Net 30", "Net 60", "Net 90", "Due on Receipt", "Custom"];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const defaultForm = { name: "", email: "", phone: "", contact: "", address: "", taxId: "", paymentTerms: "Net 30", notes: "" };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => { fetchSuppliers(); }, []);

  async function fetchSuppliers() {
    try {
      setLoading(true);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingSupplier(null);
    setFormData(defaultForm);
    setIsDialogOpen(true);
  }

  function openEdit(s: any) {
    setEditingSupplier(s);
    setFormData({
      name: s.name || "", email: s.email || "", phone: s.phone || "",
      contact: s.contact || "", address: s.address || "", taxId: s.taxId || "",
      paymentTerms: s.paymentTerms || "Net 30", notes: s.notes || "",
    });
    setIsDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Supplier name is required");
    setIsSaving(true);
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, formData);
        toast.success("Supplier updated");
      } else {
        await createSupplier(formData);
        toast.success("Supplier created");
      }
      setIsDialogOpen(false);
      fetchSuppliers();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete supplier "${name}"? This cannot be undone.`)) return;
    try {
      await deleteSupplier(id);
      toast.success("Supplier deleted");
      fetchSuppliers();
    } catch {
      toast.error("Failed to delete supplier");
    }
  }

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.phone && s.phone.includes(searchQuery))
  );

  const totalOutstanding = suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);
  const totalSpend = suppliers.reduce((sum, s) => sum + (s.totalPurchased || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 space-y-5 p-4 sm:p-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4">
        {/* Title row */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl sm:rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
              Supplier Directory
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {loading ? "Loading..." : `${suppliers.length} registered suppliers`}
            </p>
          </div>
        </div>

        {/* Action buttons — full-width on mobile, row on sm+ */}
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/purchases/payments" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto h-10 sm:h-11 px-3 sm:px-5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest gap-1.5">
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Payments</span>
            </Button>
          </Link>
          <Link href="/dashboard/purchases/analytics" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto h-10 sm:h-11 px-3 sm:px-5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Analytics</span>
            </Button>
          </Link>
          <Button
            onClick={openCreate}
            className="flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/30"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Add Supplier</span>
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Suppliers", value: suppliers.length, icon: Building2, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
          { label: "Total Spend", value: `Le ${Math.round(totalSpend).toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          { label: "Outstanding", value: `Le ${Math.round(totalOutstanding).toLocaleString()}`, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
          { label: "Active Today", value: suppliers.filter(s => new Date(s.updatedAt) > new Date(Date.now() - 86400000)).length, icon: Wallet, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-3 shadow-sm">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", kpi.bg)}>
              <kpi.icon className={cn("h-5 w-5", kpi.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</p>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Search by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 pl-11 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-sm"
        />
      </div>

      {/* ── Supplier Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
          <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-sm">
              {searchQuery ? "No results found" : "No suppliers yet"}
            </p>
            <p className="text-slate-400 text-xs">
              {searchQuery ? `No supplier matches "${searchQuery}"` : "Add your first supplier to get started"}
            </p>
          </div>
          {!searchQuery && (
            <Button
              onClick={openCreate}
              className="h-11 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" /> Add First Supplier
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200 group flex flex-col"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 flex items-center justify-center text-indigo-600 font-black text-base shrink-0">
                      {s.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight truncate">{s.name}</h3>
                      {s.paymentTerms && (
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{s.paymentTerms}</span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      {/* Always visible on mobile, hover on desktop */}
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-xl w-44">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/purchases/suppliers/${s.id}`} className="gap-2 font-semibold cursor-pointer">
                          <Eye className="h-4 w-4" /> View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(s)} className="gap-2 font-semibold">
                        <Pencil className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(s.id, s.name)} className="gap-2 font-semibold text-rose-500 focus:text-rose-500">
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Contact details */}
                <div className="space-y-1.5 mb-4 flex-1">
                  {s.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="truncate">{s.phone}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.address && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="truncate">{s.address}</span>
                    </div>
                  )}
                  {!s.phone && !s.email && !s.address && (
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 italic">No contact info</p>
                  )}
                </div>

                {/* Financials */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Spend</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                      Le {Math.round(s.totalPurchased || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outstanding</p>
                    <p className={cn("text-sm font-black truncate", (s.outstandingBalance || 0) > 0 ? "text-rose-500" : "text-emerald-500")}>
                      Le {Math.round(s.outstandingBalance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <Link href={`/dashboard/purchases/suppliers/${s.id}`} className="mt-3 block">
                  <Button variant="ghost" className="w-full h-10 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20">
                    View Full Profile <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[540px] rounded-[2rem] border-none shadow-2xl p-5 sm:p-6 bg-white dark:bg-slate-900 max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">
              {editingSupplier ? "Edit Supplier" : "New Supplier"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Supplier Name *</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Business name"
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Contact Person</Label>
                <Input value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} placeholder="Full name" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Phone</Label>
                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+232 XX XXX XXX" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="supplier@email.com" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Tax ID / Business Reg</Label>
                <Input value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} placeholder="Tax / NRA ID" className="h-12 rounded-xl" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Address</Label>
                <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Street, City" className="h-12 rounded-xl" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Payment Terms</Label>
                <select
                  value={formData.paymentTerms}
                  onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="w-full h-12 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                >
                  {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500">Notes</Label>
                <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Internal notes..." className="rounded-xl resize-none" rows={2} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="sm:flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="sm:flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white order-1 sm:order-2 gap-2"
              >
                {isSaving ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving...</> : editingSupplier ? "Update Supplier" : "Create Supplier"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
