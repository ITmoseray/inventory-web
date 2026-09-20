"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Search, ChevronRight, Pencil, Trash2, Phone, Mail, MapPin,
  Wallet, TrendingUp, AlertTriangle, Building2, MoreVertical, Eye,
  RefreshCw, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "@/lib/actions/supplier";
import { ConfirmModal } from "@/components/ui/confirm-modal";
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
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: "",
    name: "",
  });

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

  async function handleDelete(id: string) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Supplier Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {loading ? "Loading directory..." : `${suppliers.length} registered suppliers & vendors`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard/purchases/payments">
            <Button variant="outline" className="h-9 px-3.5 rounded-lg font-medium text-xs gap-1.5 border-slate-200 dark:border-slate-800">
              <Wallet className="h-3.5 w-3.5 text-slate-500" />
              <span>Payments</span>
            </Button>
          </Link>
          <Link href="/dashboard/purchases/analytics">
            <Button variant="outline" className="h-9 px-3.5 rounded-lg font-medium text-xs gap-1.5 border-slate-200 dark:border-slate-800">
              <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
              <span>Analytics</span>
            </Button>
          </Link>
          <Button
            onClick={openCreate}
            className="h-9 px-4 rounded-lg font-semibold text-xs gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span>Add Supplier</span>
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Suppliers", value: suppliers.length, icon: Building2, color: "#2563EB", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Total Spend", value: `Le ${Math.round(totalSpend).toLocaleString()}`, icon: TrendingUp, color: "#10B981", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          { label: "Outstanding Balance", value: `Le ${Math.round(totalOutstanding).toLocaleString()}`, icon: AlertTriangle, color: "#EF4444", bg: "bg-rose-50 dark:bg-rose-950/30" },
          { label: "Active Suppliers", value: suppliers.filter(s => new Date(s.updatedAt) > new Date(Date.now() - 86400000 * 30)).length, icon: Wallet, color: "#F59E0B", bg: "bg-amber-50 dark:bg-amber-950/30" },
        ].map((kpi, i) => (
          <div key={i} className="card p-4 flex items-center gap-3.5">
            <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", kpi.bg)}>
              <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white tracking-tight truncate mt-0.5">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Search by supplier name, email, phone, or contact person..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 pl-10 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1E38] font-normal text-sm"
        />
      </div>

      {/* ── Supplier Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white dark:bg-[#0F1E38] rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {searchQuery ? "No results found" : "No suppliers yet"}
            </p>
            <p className="text-slate-400 text-xs">
              {searchQuery ? `No supplier matches "${searchQuery}"` : "Add your first supplier to begin tracking purchase orders"}
            </p>
          </div>
          {!searchQuery && (
            <Button
              onClick={openCreate}
              className="h-9 px-4 rounded-lg font-semibold text-xs gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className="card p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                {/* Card header */}
                <div>
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-200 font-display font-bold text-base shrink-0">
                        {s.name ? s.name.substring(0, 2).toUpperCase() : "SP"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold font-display text-sm text-slate-900 dark:text-white truncate">{s.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {s.paymentTerms && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                              {s.paymentTerms}
                            </span>
                          )}
                          {s.contact && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              • {s.contact}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/purchases/suppliers/${s.id}`} className="gap-2 font-medium cursor-pointer text-[#2563EB]">
                            <Eye className="h-4 w-4" /> View Goods &amp; Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/purchases/suppliers/${s.id}`} className="gap-2 font-medium cursor-pointer">
                            <Package className="h-4 w-4" /> Record Goods Intake
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(s)} className="gap-2 font-medium cursor-pointer">
                          <Pencil className="h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteModal({ open: true, id: s.id, name: s.name })} className="gap-2 font-medium text-rose-600 focus:text-rose-600 cursor-pointer">
                          <Trash2 className="h-4 w-4" /> Delete Supplier
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-1.5 mb-4 text-xs text-slate-500 dark:text-slate-400">
                    {s.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{s.phone}</span>
                      </div>
                    )}
                    {s.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}
                    {s.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{s.address}</span>
                      </div>
                    )}
                    {!s.phone && !s.email && !s.address && (
                      <p className="text-[11px] text-slate-400 italic">No contact information provided</p>
                    )}
                  </div>

                  {/* Financials Breakdown */}
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Purchases</p>
                      <p className="text-sm font-bold font-mono text-slate-900 dark:text-white truncate">
                        Le {Math.round(s.totalPurchased || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Outstanding</p>
                      <p className={cn("text-sm font-bold font-mono truncate", (s.outstandingBalance || 0) > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>
                        Le {Math.round(s.outstandingBalance || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Outstanding Status Alert */}
                  {(s.outstandingBalance || 0) > 0 ? (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 rounded-lg px-3 py-2 text-xs font-semibold text-red-700 dark:text-red-400 flex items-center justify-between mb-3">
                      <span>⚠️ Outstanding Balance</span>
                      <span className="font-mono">Le {Math.round(s.outstandingBalance || 0).toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-3">
                      <span>✓ No outstanding balance</span>
                    </div>
                  )}
                </div>

                {/* Actions bottom row */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <Link href={`/dashboard/purchases/suppliers/${s.id}`} className="flex-1">
                    <Button variant="outline" className="w-full h-8 text-xs font-medium rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                      Profile & History
                    </Button>
                  </Link>
                  <Link href={`/dashboard/purchases/suppliers/${s.id}`} className="flex-1">
                    <Button className="w-full h-8 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                      New Order
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[540px] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 bg-white dark:bg-[#0F1E38] max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-display text-slate-900 dark:text-white">
              {editingSupplier ? "Edit Supplier" : "New Supplier"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Supplier Name *</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Business name"
                  className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Contact Person</Label>
                <Input value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} placeholder="Full name" className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Phone</Label>
                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+232 XX XXX XXX" className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="supplier@email.com" className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Tax ID / Business Reg</Label>
                <Input value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} placeholder="Tax / NRA ID" className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Address</Label>
                <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Street, City" className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Payment Terms</Label>
                <select
                  value={formData.paymentTerms}
                  onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium"
                >
                  {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Notes</Label>
                <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Internal notes..." className="rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 resize-none" rows={2} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="sm:flex-1 h-9 rounded-lg font-medium text-xs order-2 sm:order-1 border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="sm:flex-1 h-9 rounded-lg font-semibold text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white order-1 sm:order-2 gap-2"
              >
                {isSaving ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...</> : editingSupplier ? "Update Supplier" : "Create Supplier"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, open }))}
        title="Delete Supplier Profile"
        description={
          <>
            Are you sure you want to permanently delete supplier{" "}
            <code className="text-rose-600 dark:text-rose-400 font-mono text-[11px] bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
              {deleteModal.name}
            </code>
            ?
          </>
        }
        confirmWord="DELETE"
        confirmLabel="Delete Supplier"
        loadingLabel="Deleting…"
        warningNote="All purchase orders and transaction history linked to this supplier will be permanently removed."
        onConfirm={() => handleDelete(deleteModal.id)}
      />
    </div>
  );
}
