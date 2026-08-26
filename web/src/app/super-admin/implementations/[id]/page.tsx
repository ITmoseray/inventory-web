"use client";

import { useState, useEffect, use } from "react";
import { 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  Eye, 
  Printer, 
  FileText, 
  RefreshCw, 
  Sparkles,
  Package,
  Layers,
  MapPin,
  Lock,
  Unlock,
  Save,
  Check,
  Calendar,
  Phone,
  Mail,
  Coins,
  QrCode,
  Tag,
  Truck,
  Hash,
  Copy,
  PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/super-admin/glass-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DigitalSignaturePad } from "@/components/shared/digital-signature-pad";
import { 
  getClientImplementationById,
  updateClientRegistrationInfo,
  refreshImplementationInventorySummary,
  updateInventoryChecklist,
  saveStaffSignature,
  saveClientSignature,
  completeImplementation,
  reopenOrAmendImplementation,
  VerificationChecklistState
} from "@/lib/actions/client-implementation";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ImplementationWorkspacePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);

  // Form State - Registration
  const [regForm, setRegForm] = useState({
    clientName: "",
    ownerName: "",
    contactPhone: "",
    contactWhatsapp: "",
    contactEmail: "",
    businessAddress: "",
    city: "Freetown",
    district: "Western Area Urban",
    businessType: "SHOP",
    subscriptionPlan: "FREE",
    notes: ""
  });
  const [savingReg, setSavingReg] = useState(false);

  // Checklist State
  const [checklist, setChecklist] = useState<VerificationChecklistState>({
    allCategoriesEntered: false,
    allProductsEntered: false,
    allSuppliersEntered: false,
    openingStockEntered: false,
    purchasePricesVerified: false,
    sellingPricesVerified: false,
    expiryDatesEntered: false,
    barcodeInfoEntered: false,
    stockQuantitiesVerified: false,
    clientReviewed: false,
    clientApproved: false
  });
  const [verificationNotes, setVerificationNotes] = useState("");
  const [savingChecklist, setSavingChecklist] = useState(false);

  // Client Representative Input State
  const [clientSignerName, setClientSignerName] = useState("");
  const [clientSignerRole, setClientSignerRole] = useState("");
  const [clientSignerPhone, setClientSignerPhone] = useState("");

  // Reopen / Amend Modal State
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [amendReason, setAmendReason] = useState("");
  const [isAmending, setIsAmending] = useState(false);

  // Refresh Inventory Loading
  const [refreshingInv, setRefreshingInv] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchRecord();
  }, [id]);

  async function fetchRecord() {
    try {
      setLoading(true);
      const data = await getClientImplementationById(id);
      setRecord(data);

      // Populate Registration Form
      setRegForm({
        clientName: data.clientName || data.business?.name || "",
        ownerName: data.ownerName || "",
        contactPhone: data.contactPhone || data.business?.phone || "",
        contactWhatsapp: data.contactWhatsapp || data.business?.whatsappPhone || "",
        contactEmail: data.contactEmail || data.business?.email || "",
        businessAddress: data.businessAddress || data.business?.address || "",
        city: data.city || "Freetown",
        district: data.district || "Western Area Urban",
        businessType: data.businessType || data.business?.type || "SHOP",
        subscriptionPlan: data.subscriptionPlan || data.business?.plan || "FREE",
        notes: data.notes || ""
      });

      // Populate Checklist
      if (data.verificationChecklist) {
        setChecklist(data.verificationChecklist as any);
      }
      setVerificationNotes(data.verificationNotes || "");

      // Populate Client Signer Inputs
      setClientSignerName(data.clientSignerName || data.ownerName || "");
      setClientSignerRole(data.clientSignerRole || "Managing Director / Owner");
      setClientSignerPhone(data.clientSignerPhone || data.contactPhone || "");
    } catch (err: any) {
      toast.error(err.message || "Failed to load implementation record.");
      router.push("/super-admin/implementations");
    } finally {
      setLoading(false);
    }
  }

  // 1. Save Registration
  async function handleSaveRegistration() {
    try {
      setSavingReg(true);
      const updated = await updateClientRegistrationInfo(id, regForm);
      setRecord(updated);
      toast.success("Client registration details saved & synchronized with business.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save registration info.");
    } finally {
      setSavingReg(false);
    }
  }

  // 2. Refresh Inventory Stats
  async function handleRefreshInventory() {
    try {
      setRefreshingInv(true);
      const updated = await refreshImplementationInventorySummary(id);
      setRecord(updated);
      toast.success("Live inventory summary refreshed from database.");
    } catch (err: any) {
      toast.error(err.message || "Failed to refresh inventory.");
    } finally {
      setRefreshingInv(false);
    }
  }

  // 3. Save Checklist
  async function handleSaveChecklist() {
    try {
      setSavingChecklist(true);
      const updated = await updateInventoryChecklist(id, checklist, verificationNotes);
      setRecord(updated);
      toast.success("Inventory verification checklist state updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update checklist.");
    } finally {
      setSavingChecklist(false);
    }
  }

  // 4. Save Staff Signature
  async function handleStaffSignature(base64: string) {
    try {
      const updated = await saveStaffSignature(id, base64);
      setRecord(updated);
    } catch (err: any) {
      throw err;
    }
  }

  // 5. Save Client Signature
  async function handleClientSignature(base64: string) {
    if (!clientSignerName.trim()) {
      toast.error("Please enter the client representative's full name.");
      throw new Error("Client signer name is required.");
    }
    if (!clientSignerRole.trim()) {
      toast.error("Please enter the client representative's position / role.");
      throw new Error("Client signer role is required.");
    }

    try {
      const updated = await saveClientSignature(id, {
        clientSignature: base64,
        clientSignerName,
        clientSignerRole,
        clientSignerPhone
      });
      setRecord(updated);
    } catch (err: any) {
      throw err;
    }
  }

  // 6. Complete Implementation
  async function handleCompleteImplementation() {
    try {
      setCompleting(true);
      const updated = await completeImplementation(id);
      setRecord(updated);
      toast.success("Implementation completed and locked! Certification report ready.");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete implementation.");
    } finally {
      setCompleting(false);
    }
  }

  // 7. Reopen / Amend Implementation
  async function handleReopenRecord() {
    if (!amendReason.trim() || amendReason.trim().length < 10) {
      toast.error("Please provide a detailed amendment reason (at least 10 characters).");
      return;
    }

    try {
      setIsAmending(true);
      const updated = await reopenOrAmendImplementation(id, amendReason);
      setRecord(updated);
      setReopenModalOpen(false);
      setAmendReason("");
      toast.success("Record unlocked for authorized amendments.");
    } catch (err: any) {
      toast.error(err.message || "Failed to reopen record.");
    } finally {
      setIsAmending(false);
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard.`);
  };

  if (loading || !record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Loading Implementation Workspace...</p>
      </div>
    );
  }

  const isLocked = record.isLocked;
  const invSummary = record.inventorySummary || {};
  const checklistItems = [
    { key: "allCategoriesEntered", label: "All categories entered", desc: "Catalog categories structured & organized" },
    { key: "allProductsEntered", label: "All products entered", desc: "Item names, SKUs, and units registered" },
    { key: "allSuppliersEntered", label: "All suppliers entered", desc: "Vendor details and contact lines recorded" },
    { key: "openingStockEntered", label: "Opening stock entered", desc: "Initial shelf and warehouse inventory counted" },
    { key: "purchasePricesVerified", label: "Purchase prices verified", desc: "Cost prices match vendor invoices / supply records" },
    { key: "sellingPricesVerified", label: "Selling prices verified", desc: "Retail and wholesale selling rates configured" },
    { key: "expiryDatesEntered", label: "Expiry dates entered", desc: "Perishables and medicine batch expiries logged" },
    { key: "barcodeInfoEntered", label: "Barcode information entered", desc: "POS barcode scanners mapped and tested" },
    { key: "stockQuantitiesVerified", label: "Stock quantities physically verified", desc: "Physical count matched with system numbers" },
    { key: "clientReviewed", label: "Client reviewed inventory", desc: "Owner/manager inspected the digital database" },
    { key: "clientApproved", label: "Client approved inventory", desc: "Formal authorization granted by client" },
  ];

  const verifiedChecklistCount = Object.values(checklist).filter(Boolean).length;
  const isAllChecklistDone = verifiedChecklistCount === checklistItems.length;

  const canComplete = 
    record.registrationCompleted &&
    isAllChecklistDone &&
    record.staffSignature &&
    record.clientSignature &&
    !isLocked;

  const steps = [
    { num: 1, label: "Registration", done: record.registrationCompleted },
    { num: 2, label: "Inventory Audit", done: (invSummary.totalProducts || 0) > 0 },
    { num: 3, label: "Verification", done: record.inventoryVerified || isAllChecklistDone },
    { num: 4, label: "Signatures", done: !!(record.staffSignature && record.clientSignature) },
    { num: 5, label: "Completed", done: record.status === "COMPLETED" },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 space-y-8 max-w-6xl mx-auto pb-32">
      {/* Top Navigation & Status Banner */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/super-admin/implementations"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  {record.implementationNumber}
                </span>
                {isLocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    <Lock className="h-3 w-3" />
                    Locked &amp; Certified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                    <Clock className="h-3 w-3" />
                    Active Workspace
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-[1000] tracking-tight uppercase italic text-slate-900 dark:text-white mt-1">
                {record.clientName || record.business?.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/super-admin/implementations/${record.id}/report`}>
              <Button 
                variant="outline"
                className="h-10 px-4 rounded-xl text-xs font-bold gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400"
              >
                <FileText className="h-4 w-4" />
                <span>Completion Report</span>
              </Button>
            </Link>

            {isLocked && (
              <Button
                variant="ghost"
                onClick={() => setReopenModalOpen(true)}
                className="h-10 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-orange-600 gap-1.5"
              >
                <Unlock className="h-3.5 w-3.5" />
                <span>Amend</span>
              </Button>
            )}
          </div>
        </div>

        {/* Step Progress Stepper */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
            {steps.map((s, idx) => (
              <div 
                key={s.num}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl border transition-all",
                  s.done 
                    ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300"
                    : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                  s.done ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}>
                  {s.done ? <Check className="h-3.5 w-3.5" /> : s.num}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-wider truncate">{s.label}</p>
                  <p className="text-[8px] font-bold opacity-75">{s.done ? "Complete" : "Pending"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 1: Client & Business Registration */}
      <GlassCard className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
              1
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Client &amp; Business Registration Profile
              </h3>
              <p className="text-xs text-slate-500 font-medium">Verify primary identity, contacts, address, and license parameters.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(record.businessId, "Business ID")}
              className="h-8 px-2.5 rounded-lg text-[10px] font-mono font-bold text-slate-500 gap-1"
            >
              <Copy className="h-3 w-3" />
              ID: {record.businessId.slice(0, 10)}...
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Business Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Business Name</label>
            <Input 
              value={regForm.clientName}
              onChange={(e) => setRegForm({ ...regForm, clientName: e.target.value })}
              disabled={isLocked}
              className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          {/* Owner / Manager Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Owner / Manager Name</label>
            <Input 
              value={regForm.ownerName}
              onChange={(e) => setRegForm({ ...regForm, ownerName: e.target.value })}
              disabled={isLocked}
              className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          {/* Primary Phone */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Primary Phone</label>
            <Input 
              value={regForm.contactPhone}
              onChange={(e) => setRegForm({ ...regForm, contactPhone: e.target.value })}
              disabled={isLocked}
              className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          {/* WhatsApp Line */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">WhatsApp Line</label>
            <Input 
              value={regForm.contactWhatsapp}
              onChange={(e) => setRegForm({ ...regForm, contactWhatsapp: e.target.value })}
              disabled={isLocked}
              className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          {/* Official Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Official Email</label>
            <Input 
              value={regForm.contactEmail}
              onChange={(e) => setRegForm({ ...regForm, contactEmail: e.target.value })}
              disabled={isLocked}
              className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          {/* Business Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Business Type / Industry</label>
            <Select 
              value={regForm.businessType} 
              onValueChange={(val) => setRegForm({ ...regForm, businessType: val })}
              disabled={isLocked}
            >
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SHOP">Shop / Retail Store</SelectItem>
                <SelectItem value="SUPERMARKET">Supermarket / Grocery</SelectItem>
                <SelectItem value="BAR">Bar &amp; Lounge</SelectItem>
                <SelectItem value="RESTAURANT">Restaurant &amp; Dining</SelectItem>
                <SelectItem value="PHARMACY">Pharmacy / Drugstore</SelectItem>
                <SelectItem value="CLINIC">Medical Clinic</SelectItem>
                <SelectItem value="HOSPITAL">Hospital</SelectItem>
                <SelectItem value="BOUTIQUE">Boutique &amp; Apparel</SelectItem>
                <SelectItem value="ELECTRONICS">Electronics &amp; Appliances</SelectItem>
                <SelectItem value="WAREHOUSE">Warehouse &amp; Distribution</SelectItem>
                <SelectItem value="OFFICE">Enterprise Office</SelectItem>
                <SelectItem value="SCHOOL">School / Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Business Address */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Physical Address</label>
            <Input 
              value={regForm.businessAddress}
              onChange={(e) => setRegForm({ ...regForm, businessAddress: e.target.value })}
              disabled={isLocked}
              className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">City / Town</label>
            <Input 
              value={regForm.city}
              onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
              disabled={isLocked}
              className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          {/* District */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">District / Region</label>
            <Input 
              value={regForm.district}
              onChange={(e) => setRegForm({ ...regForm, district: e.target.value })}
              disabled={isLocked}
              className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          {/* Subscription Plan */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">License Tier Plan</label>
            <Select 
              value={regForm.subscriptionPlan} 
              onValueChange={(val) => setRegForm({ ...regForm, subscriptionPlan: val })}
              disabled={isLocked}
            >
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">Free Trial Tier</SelectItem>
                <SelectItem value="BASIC">Basic Node</SelectItem>
                <SelectItem value="STANDARD">Standard Pro Node</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise Vault Node</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assigned Staff */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Assigned Implementation Lead</label>
            <Input 
              value={record.assignedStaffName || "Super Admin Field Officer"}
              readOnly
              className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60 font-bold text-xs cursor-not-allowed opacity-80"
            />
          </div>
        </div>

        {!isLocked && (
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveRegistration}
              disabled={savingReg}
              className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 gap-2"
            >
              {savingReg ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Registration Information
            </Button>
          </div>
        )}
      </GlassCard>

      {/* SECTION 2: Real-time Inventory Summary */}
      <GlassCard className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              2
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Live Inventory &amp; Stock Summary
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live metrics aggregated directly from client's active database tables.
              </p>
            </div>
          </div>

          {!isLocked && (
            <Button
              onClick={handleRefreshInventory}
              disabled={refreshingInv}
              variant="outline"
              className="h-9 px-4 rounded-xl text-xs font-bold gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshingInv && "animate-spin")} />
              <span>Refresh Inventory Summary</span>
            </Button>
          )}
        </div>

        {/* 11 Calculated Inventory Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Categories</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{invSummary.totalCategories ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Total Products</p>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{invSummary.totalProducts ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Suppliers</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{invSummary.totalSuppliers ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">Total Stock Items</p>
            <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{invSummary.totalStockItems ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">With Barcodes</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{invSummary.productsWithBarcodes ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">With Expiry Dates</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{invSummary.productsWithExpiryDates ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">With Purchase Prices</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{invSummary.productsWithPurchasePrices ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">With Selling Prices</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{invSummary.productsWithSellingPrices ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">With Opening Stock</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{invSummary.productsWithOpeningStock ?? 0}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Quantity</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{(invSummary.totalQuantity ?? 0).toLocaleString()} Units</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 sm:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Total Verified Valuation</p>
            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-0.5">
              Le {(invSummary.totalValuation ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {invSummary.refreshedAt && (
          <p className="text-[10px] text-slate-400 italic">
            Last live database snapshot: {format(new Date(invSummary.refreshedAt), "PPP 'at' pp")}
          </p>
        )}
      </GlassCard>

      {/* SECTION 3: Inventory Verification Checklist */}
      <GlassCard className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              3
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Inventory Verification Checklist
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Mandatory audit checklist required before signatures and final completion lock.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
              isAllChecklistDone 
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300"
                : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300"
            )}>
              {verifiedChecklistCount} of {checklistItems.length} Verified ({Math.round((verifiedChecklistCount / checklistItems.length) * 100)}%)
            </span>
          </div>
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistItems.map((item) => {
            const isChecked = (checklist as any)[item.key] || false;
            return (
              <div
                key={item.key}
                onClick={() => {
                  if (isLocked) return;
                  setChecklist(prev => ({ ...prev, [item.key]: !isChecked }));
                }}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all flex items-start gap-3 select-none",
                  isLocked ? "cursor-default opacity-85" : "cursor-pointer",
                  isChecked 
                    ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800" 
                    : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "h-5 w-5 rounded-lg border flex items-center justify-center text-white mt-0.5 shrink-0 transition-colors",
                  isChecked 
                    ? "bg-emerald-600 border-emerald-600" 
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                )}>
                  {isChecked && <Check className="h-3.5 w-3.5" />}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className={cn(
                    "text-xs font-black tracking-tight",
                    isChecked ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                  )}>
                    {item.label}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Auditor Notes */}
        <div className="space-y-1 pt-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Auditor / Field Verification Notes</label>
          <Textarea 
            placeholder="Enter any physical count variances, barcode device details, or custom notes..."
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            disabled={isLocked}
            rows={2}
            className="rounded-xl bg-slate-50 dark:bg-slate-950 text-xs font-medium"
          />
        </div>

        {!isLocked && (
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveChecklist}
              disabled={savingChecklist}
              className="h-10 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-amber-600/20 gap-2"
            >
              {savingChecklist ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Verification Checklist State
            </Button>
          </div>
        )}
      </GlassCard>

      {/* SECTION 4: Digital Staff Signature */}
      <GlassCard className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
            4
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Staff Implementation Declaration &amp; Digital Signature
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Lead implementation officer certification of inventory audit accuracy.
            </p>
          </div>
        </div>

        {/* Staff Declaration Box */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
          <p className="font-bold uppercase tracking-wide text-[10px] text-indigo-600 dark:text-indigo-400 mb-1">Official Staff Declaration</p>
          &quot;I confirm that the client registration and inventory information recorded in this implementation has been completed and verified to the best of my knowledge.&quot;
        </div>

        {/* Signature Pad */}
        <DigitalSignaturePad
          label="Staff Hand-Drawn Signature"
          description="Sign using your mouse, touchpad, touchscreen, or stylus pen."
          initialSignature={record.staffSignature}
          signerName={record.staffSignerName || record.assignedStaffName || "Super Admin Implementation Lead"}
          signerRole={record.staffSignerRole || "Protech Enterprise Auditor"}
          signedAt={record.staffSignedAt}
          onSaveSignature={handleStaffSignature}
          isLocked={isLocked}
        />
      </GlassCard>

      {/* SECTION 5: Digital Client Signature */}
      <GlassCard className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="h-10 w-10 rounded-2xl bg-violet-500/10 dark:bg-violet-600/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-black">
            5
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Client / Authorized Representative Confirmation &amp; Digital Signature
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Client authorization approving inventory data and implementation setup.
            </p>
          </div>
        </div>

        {/* Client Confirmation Box */}
        <div className="p-4 rounded-2xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 text-xs text-violet-900 dark:text-violet-200 leading-relaxed font-medium">
          <p className="font-bold uppercase tracking-wide text-[10px] text-violet-600 dark:text-violet-400 mb-1">Client Authorization Confirmation</p>
          &quot;I confirm that I have reviewed the recorded business and inventory information and approve the information provided.&quot;
        </div>

        {/* Client Representative Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Representative Full Name *</label>
            <Input 
              value={clientSignerName}
              onChange={(e) => setClientSignerName(e.target.value)}
              disabled={isLocked}
              placeholder="e.g. Melina Tamba"
              className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Position / Role *</label>
            <Input 
              value={clientSignerRole}
              onChange={(e) => setClientSignerRole(e.target.value)}
              disabled={isLocked}
              placeholder="e.g. Managing Director / Owner"
              className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Representative Phone</label>
            <Input 
              value={clientSignerPhone}
              onChange={(e) => setClientSignerPhone(e.target.value)}
              disabled={isLocked}
              placeholder="e.g. +232 79 373838"
              className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-xs"
            />
          </div>
        </div>

        {/* Signature Pad */}
        <DigitalSignaturePad
          label="Client Representative Hand-Drawn Signature"
          description="The client must draw their official digital signature on this pad."
          initialSignature={record.clientSignature}
          signerName={record.clientSignerName || clientSignerName}
          signerRole={record.clientSignerRole || clientSignerRole}
          signedAt={record.clientSignedAt}
          onSaveSignature={handleClientSignature}
          isLocked={isLocked}
        />
      </GlassCard>

      {/* SECTION 6: Final Completion & Locking */}
      <GlassCard className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
            ✓
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Final Certification &amp; Record Locking
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Review completion prerequisites and permanently certify the implementation record.
            </p>
          </div>
        </div>

        {/* Verification Checklist Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={cn(
            "p-3 rounded-xl border flex items-center gap-2.5",
            record.registrationCompleted ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300" : "bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-400"
          )}>
            <CheckCircle2 className={cn("h-4 w-4 shrink-0", record.registrationCompleted ? "text-emerald-600" : "text-slate-300")} />
            <span className="text-xs font-bold">1. Registration Info Saved</span>
          </div>

          <div className={cn(
            "p-3 rounded-xl border flex items-center gap-2.5",
            isAllChecklistDone ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300" : "bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-400"
          )}>
            <CheckCircle2 className={cn("h-4 w-4 shrink-0", isAllChecklistDone ? "text-emerald-600" : "text-slate-300")} />
            <span className="text-xs font-bold">2. Checklist (11/11 Verified)</span>
          </div>

          <div className={cn(
            "p-3 rounded-xl border flex items-center gap-2.5",
            record.staffSignature ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300" : "bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-400"
          )}>
            <CheckCircle2 className={cn("h-4 w-4 shrink-0", record.staffSignature ? "text-emerald-600" : "text-slate-300")} />
            <span className="text-xs font-bold">3. Staff Signature Saved</span>
          </div>

          <div className={cn(
            "p-3 rounded-xl border flex items-center gap-2.5",
            record.clientSignature ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300" : "bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-400"
          )}>
            <CheckCircle2 className={cn("h-4 w-4 shrink-0", record.clientSignature ? "text-emerald-600" : "text-slate-300")} />
            <span className="text-xs font-bold">4. Client Signature Saved</span>
          </div>
        </div>

        {isLocked ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="text-base font-black uppercase text-emerald-900 dark:text-emerald-200">
              Implementation Officially Completed &amp; Certified
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
              Completed on {record.completedAt ? format(new Date(record.completedAt), "PPP 'at' pp") : "N/A"} by {record.completedBy || "Super Admin"}.
            </p>
            <div className="pt-3">
              <Link href={`/super-admin/implementations/${record.id}/report`}>
                <Button className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-emerald-600/20">
                  <Printer className="h-4 w-4" />
                  Print &amp; Download Completion Certificate Report
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Ready to certify implementation?</p>
              <p className="text-[10px] text-slate-400 font-medium">Once locked, the record becomes permanent and tamper-proof.</p>
            </div>

            <Button
              onClick={handleCompleteImplementation}
              disabled={!canComplete || completing}
              className={cn(
                "h-12 px-8 rounded-xl font-black text-xs uppercase tracking-widest gap-2 shadow-lg transition-all",
                canComplete 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/25 hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
              )}
            >
              {completing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Complete &amp; Lock Implementation
            </Button>
          </div>
        )}
      </GlassCard>

      {/* Reopen / Amendment Modal */}
      <Dialog open={reopenModalOpen} onOpenChange={setReopenModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Unlock Record For Authorized Amendment
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Provide an official revision reason. All amendments are permanently logged in the audit trail without destroying the original signed record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Textarea 
              placeholder="e.g. Client added 15 new batch items during secondary shelf audit..."
              value={amendReason}
              onChange={(e) => setAmendReason(e.target.value)}
              rows={3}
              className="rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              onClick={() => setReopenModalOpen(false)}
              className="h-10 rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReopenRecord}
              disabled={!amendReason.trim() || isAmending}
              className="h-10 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-wider"
            >
              {isAmending ? "Unlocking..." : "Authorize Amendment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
