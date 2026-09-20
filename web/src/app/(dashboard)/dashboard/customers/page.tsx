"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, Pencil, Trash2, MoreVertical, Users, Search, Phone, Mail, MapPin,
  ChevronDown, UserPlus, FileDown, Globe, Database, CreditCard, Clock,
  ArrowRight, CheckCircle2, MessageSquare, Briefcase, Info, ShieldCheck, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  importCustomers,
} from "@/lib/actions/customer";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { EnterprisePageHeader, EnterpriseKpiCard, EnterpriseBadge } from "@/components/enterprise";


export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: "",
    name: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [viewFilter, setViewFilter] = useState("all");
  const [viewSearch, setViewSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const VIEWS = [
    { val: "all", label: "All Customers" },
    { val: "active", label: "Active Customers" },
    { val: "crm", label: "CRM Customers" },
    { val: "duplicate", label: "Duplicate Customers" },
    { val: "inactive", label: "Inactive Customers" },
    { val: "overdue", label: "Overdue Customers" },
    { val: "unpaid", label: "Unpaid Customers" },
    { val: "new", label: "New Customers" }
  ];

  const filteredViews = VIEWS.filter(v => 
    v.label.toLowerCase().includes(viewSearch.toLowerCase())
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error("Failed to load customer database.");
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery)) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
        toast.success("Customer profile updated.");
      } else {
        await createCustomer(formData);
        toast.success("New customer registered.");
      }
      setIsDialogOpen(false);
      setEditingCustomer(null);
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to save customer details.");
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h] = vals[i] || ""; });
        return {
          name: row["name"] || row["customer name"] || row["full name"] || "",
          email: row["email"] || "",
          phone: row["phone"] || row["phone number"] || row["mobile"] || "",
          address: row["address"] || row["location"] || "",
        };
      }).filter(r => r.name);

      if (rows.length === 0) {
        toast.error("No valid rows found. Check your CSV has a 'name' column.");
        return;
      }

      const result = await importCustomers(rows);
      toast.success(`Successfully imported ${result.count} customer${result.count !== 1 ? "s" : ""}.`);
      fetchCustomers();
    } catch (error) {
      toast.error("Import failed. Please check your file format.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCustomer(id);
      toast.success("Customer record removed.");
      fetchCustomers();
    } catch (error) {
      toast.error("Operation failed.");
    }
  }

  function handleEdit(customer: any) {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setIsDialogOpen(true);
  }

  const totalLTV = customers.reduce((sum, c) => sum + (Number(c.totalSpend) || 0), 0);
  const activeCustomers = customers.filter(c => (Number(c.totalSpend) || 0) > 0).length;
  const highValueCustomers = customers.filter(c => (Number(c.totalSpend) || 0) > 1000).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Customer Directory & CRM
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Manage customer relationships, contact credentials, lifetime sales value, and payment history
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-4"
          >
            <FileDown size={14} className="text-[#2563EB]" /> {importing ? "Importing..." : "Import CSV"}
          </button>
          <button
            onClick={() => {
              setEditingCustomer(null);
              resetForm();
              setIsDialogOpen(true);
            }}
            className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-4"
          >
            <Plus size={14} /> New Customer
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="kpi-card">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Total Customers</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#2563EB]/10 text-[#2563EB]">
              <Users size={16} />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
            {customers.length}
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Active Customers</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#10B981]/10 text-[#10B981]">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-[#10B981] tracking-tight">
            {activeCustomers}
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Lifetime Value (LTV)</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#8B5CF6]/10 text-[#8B5CF6]">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-[#8B5CF6] tracking-tight">
            Le {Math.round(totalLTV).toLocaleString()}
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">High-Value Clients</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F59E0B]/10 text-[#F59E0B]">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-[#F59E0B] tracking-tight">
            {highValueCustomers}
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search ── */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            placeholder="Search by customer name, phone, or email..."
            className="input-field pl-10 w-full text-xs font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Main Customers Table & Side Profile Panel ── */}
      <div className="flex gap-6 items-start">
        {/* Table */}
        <div className="card overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                  <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Customer</th>
                  <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Contact</th>
                  <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Location</th>
                  <th className="text-right text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Lifetime Value</th>
                  <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Status</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-[var(--border)]">
                      <td colSpan={6} className="px-4 py-6 text-center">
                        <div className="h-4 bg-[var(--muted)] rounded animate-pulse w-1/3 mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[var(--muted-foreground)]">
                      <Users size={36} className="mx-auto mb-3 opacity-30" />
                      <p className="font-semibold text-sm">No customers found</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">Register your first customer to get started.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const spend = customer.totalSpend || 0;
                    return (
                      <tr
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="table-row-hover border-b border-[var(--border)] cursor-pointer text-xs group"
                      >
                        {/* Customer Avatar & Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1B3F6E] to-[#2563EB] flex items-center justify-center font-bold text-white text-xs shrink-0">
                              {customer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-[var(--foreground)]">{customer.name}</div>
                              <div className="text-[10px] text-[var(--muted-foreground)]">
                                Est: {new Date(customer.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3.5">
                          {customer.phone && (
                            <div className="text-[11px] font-mono text-[var(--foreground)] flex items-center gap-1.5">
                              <Phone size={11} className="text-[var(--muted-foreground)]" /> {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1.5 mt-0.5">
                              <Mail size={11} /> {customer.email}
                            </div>
                          )}
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3.5 text-[var(--muted-foreground)]">
                          {customer.address ? (
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-rose-500 shrink-0" /> {customer.address}
                            </span>
                          ) : (
                            <span className="text-[10px] italic">Unmapped</span>
                          )}
                        </td>

                        {/* LTV */}
                        <td className="px-4 py-3.5 text-right font-mono font-extrabold text-sm text-[var(--foreground)]">
                          Le {Math.round(spend).toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          {spend > 5000 ? (
                            <span className="status-badge" style={{ background: "#FEF3C7", color: "#D97706" }}>Gold Tier</span>
                          ) : spend > 1000 ? (
                            <span className="status-badge" style={{ background: "#F1F5F9", color: "#475569" }}>Silver Tier</span>
                          ) : (
                            <span className="status-badge" style={{ background: "#EFF6FF", color: "#2563EB" }}>Standard</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[#2563EB] hover:bg-[var(--muted)] transition-all">
                                <MoreVertical size={16} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-xl border border-[var(--border)] shadow-xl p-1 bg-[var(--card)]">
                              <DropdownMenuItem
                                onClick={() => setSelectedCustomer(customer)}
                                className="rounded-lg cursor-pointer text-xs font-medium gap-2"
                              >
                                <Users size={14} className="text-[#2563EB]" /> View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(customer)}
                                className="rounded-lg cursor-pointer text-xs font-medium gap-2"
                              >
                                <Pencil size={14} /> Edit Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteModal({ open: true, id: customer.id, name: customer.name })}
                                className="rounded-lg cursor-pointer text-xs font-medium gap-2 text-rose-600 focus:text-rose-700"
                              >
                                <Trash2 size={14} /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Customer Profile Side Panel (Figma Make layout) ── */}
        {selectedCustomer && (
          <div className="w-80 card p-5 shrink-0 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-sm text-[var(--foreground)]">Customer Profile</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] text-sm"
              >
                ×
              </button>
            </div>

            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1B3F6E] to-[#2563EB] flex items-center justify-center text-xl font-extrabold text-white mx-auto mb-2 shadow-md">
                {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="font-display font-extrabold text-base text-[var(--foreground)]">{selectedCustomer.name}</div>
              <span className="status-badge inline-block mt-1" style={{ background: "#DCFCE7", color: "#15803D" }}>
                Active Client
              </span>
            </div>

            <div className="space-y-2.5 p-3.5 bg-[var(--muted)] rounded-xl mb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Phone</span>
                <span className="font-mono font-semibold text-[var(--foreground)]">{selectedCustomer.phone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Email</span>
                <span className="font-medium text-[var(--foreground)] truncate max-w-[150px]">{selectedCustomer.email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Address</span>
                <span className="font-medium text-[var(--foreground)] truncate max-w-[150px]">{selectedCustomer.address || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Member Since</span>
                <span className="font-mono text-[var(--foreground)]">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 text-center">
                <div className="text-[10px] font-semibold text-[var(--muted-foreground)] mb-1">Total Spent</div>
                <div className="font-mono font-extrabold text-sm text-[#2563EB]">
                  Le {Math.round(selectedCustomer.totalSpend || 0).toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-center">
                <div className="text-[10px] font-semibold text-[var(--muted-foreground)] mb-1">Account Status</div>
                <div className="font-mono font-extrabold text-sm text-[#10B981]">
                  Clear
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(selectedCustomer)}
                className="btn-secondary flex-1 py-2 text-xs font-semibold"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="btn-primary flex-1 py-2 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Customer Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingCustomer(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl border border-[var(--border)] shadow-2xl p-0 overflow-hidden bg-[var(--card)] text-[var(--foreground)]">
          <div className="bg-[#0B1629] p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users size={100} />
            </div>
            <div className="relative z-10 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Customer Relationship Management</div>
              <DialogTitle className="text-xl font-extrabold font-display">
                {editingCustomer ? "Edit Customer Profile" : "Register New Customer"}
              </DialogTitle>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Full Name / Company Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tech Enterprise"
                  className="input-field w-full text-xs font-medium"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Phone Number</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+232..."
                    className="input-field w-full text-xs font-medium font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@company.com"
                    className="input-field w-full text-xs font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Physical Address / Location</label>
                <input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, Zone..."
                  className="input-field w-full text-xs font-medium"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                className="btn-secondary flex-1 py-2.5 text-xs font-semibold"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 py-2.5 text-xs font-semibold"
              >
                {editingCustomer ? "Update Customer" : "Save Customer"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, open }))}
        title="Delete Customer Account"
        description={
          <>
            Are you sure you want to delete customer record for{" "}
            <code className="text-rose-600 dark:text-rose-400 font-mono text-[11px] bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
              {deleteModal.name}
            </code>
            ?
          </>
        }
        confirmWord="DELETE"
        confirmLabel="Delete Customer"
        loadingLabel="Deleting…"
        warningNote="All purchase history, credit records, and loyalty data for this customer will be permanently removed."
        onConfirm={() => handleDelete(deleteModal.id)}
      />
    </div>
  );
}

// Format date helper (simplified)
function format(date: Date, pattern: string) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  if (pattern === "MMM yyyy") return `${m} ${y}`;
  return date.toLocaleDateString();
}
