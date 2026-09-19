"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CheckCircle2, 
  Globe, 
  Package, 
  Truck, 
  BarChart3, 
  MapPin, 
  Calendar, 
  Coins, 
  Languages,
  Clock,
  ArrowRight,
  ArrowLeft,
  Info,
  ShieldCheck,
  Zap,
  Box,
  Layout,
  User,
  Users,
  Building2,
  Receipt,
  Sparkles,
  CreditCard,
  Plus,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const INDUSTRIES = [
  "Retail & Shop", "Supermarket", "Pharmacy", "Wholesale & Distribution", 
  "Hardware & Tools", "Boutique & Fashion", "Electronics", "Bar & Restaurant",
  "Hospital & Clinic", "School & Education", "Manufacturing", "Corporate Office"
];

const CURRENCIES = [
  { code: "SLE", name: "Sierra Leonean Leone (SLE / NLe)" },
  { code: "USD", name: "US Dollar ($)" },
  { code: "GBP", name: "British Pound (£)" },
  { code: "EUR", name: "Euro (€)" },
  { code: "NGN", name: "Nigerian Naira (₦)" }
];

export default function SetupOrganizationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Business Info
    name: "",
    industry: "Retail & Shop",
    phone: "",
    email: "",
    address: "",
    country: "Sierra Leone",
    currency: "SLE",

    // Step 2: Setup
    defaultWarehouse: "Main Central Store",
    taxRate: "15",
    paymentMethods: ["CASH", "ORANGE_MONEY", "AFRIMONEY"],
    invoicePrefix: "INV-2026",

    // Step 3: Product
    productName: "",
    productSku: "",
    productPrice: "",
    productCost: "",
    productStock: "",

    // Step 4: Team
    staffEmail: "",
    staffRole: "CASHIER",
  });

  useEffect(() => {
    if (session?.user?.business?.name) {
      setFormData(prev => ({ ...prev, name: session.user.business.name }));
    }
  }, [session]);

  const handleNext = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      toast.error("Please enter your business name.");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinish = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Welcome to ProTech Assist Enterprise OS!");
      router.push("/dashboard");
    }, 1200);
  };

  const STEPS = [
    { num: 1, label: "Business Info" },
    { num: 2, label: "Setup" },
    { num: 3, label: "Initial Products" },
    { num: 4, label: "Invite Team" },
    { num: 5, label: "Launch" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-xl bg-white border border-slate-200 dark:border-slate-800 shadow-sm p-1">
            <Image src="/images/PA.png" alt="Logo" width={40} height={40} className="object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight">ProTech Assist Enterprise OS</h1>
            <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Guided Organization Onboarding</p>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500">
          Step {currentStep} of 5
        </div>
      </header>

      {/* Progress Stepper Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        />
      </div>

      {/* Stepper Navigation Pills */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-8 pb-4">
        <div className="flex items-center justify-between">
          {STEPS.map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                  currentStep === s.num 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110"
                    : currentStep > s.num 
                    ? "bg-emerald-500 text-white" 
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                )}
              >
                {currentStep > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-slate-600 dark:text-slate-400">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col justify-center">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl space-y-6">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: BUSINESS INFORMATION ─────────────────────── */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Step 1 of 5
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Business Profile & Location
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Provide the core details of your commercial organization.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Organization / Business Name *
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Freetown Supermarket & Wholesale"
                      className="h-12 rounded-xl font-bold text-sm"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Industry / Business Type
                      </Label>
                      <Select 
                        value={formData.industry} 
                        onValueChange={(val) => setFormData({ ...formData, industry: val })}
                      >
                        <SelectTrigger className="h-12 rounded-xl font-bold text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {INDUSTRIES.map(i => (
                            <SelectItem key={i} value={i} className="font-bold text-sm">{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Primary Currency
                      </Label>
                      <Select 
                        value={formData.currency} 
                        onValueChange={(val) => setFormData({ ...formData, currency: val })}
                      >
                        <SelectTrigger className="h-12 rounded-xl font-bold text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {CURRENCIES.map(c => (
                            <SelectItem key={c.code} value={c.code} className="font-bold text-sm">{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Contact Phone
                      </Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+232 76 000 000"
                        className="h-12 rounded-xl font-bold text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Official Email
                      </Label>
                      <Input
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="orders@business.sl"
                        className="h-12 rounded-xl font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Physical Address
                    </Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. 14 Siaka Stevens Street, Freetown"
                      className="h-12 rounded-xl font-bold text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: BUSINESS SETUP ───────────────────────────── */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Step 2 of 5
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Warehouses & Invoicing
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure your stock storage nodes and financial invoice numbering.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Primary Stock Warehouse
                    </Label>
                    <Input
                      value={formData.defaultWarehouse}
                      onChange={(e) => setFormData({ ...formData, defaultWarehouse: e.target.value })}
                      placeholder="e.g. Main Central Store"
                      className="h-12 rounded-xl font-bold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Default GST/VAT Tax Rate (%)
                      </Label>
                      <Input
                        type="number"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                        placeholder="15"
                        className="h-12 rounded-xl font-bold text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Invoice Number Prefix
                      </Label>
                      <Input
                        value={formData.invoicePrefix}
                        onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                        placeholder="INV-2026"
                        className="h-12 rounded-xl font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-300 font-medium space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      <span>Ready for Cash, Orange Money, and AfriMoney</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Local mobile payments are activated by default so cashiers can reconcile payments instantly.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: INITIAL PRODUCTS ─────────────────────────── */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Step 3 of 5
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Add Your First Product
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Add an initial item or skip to import your catalog via Excel/CSV later.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Product Name
                    </Label>
                    <Input
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      placeholder="e.g. Paracetamol 500mg or Jasmine Rice 25kg"
                      className="h-12 rounded-xl font-bold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Cost Price (SLE)
                      </Label>
                      <Input
                        type="number"
                        value={formData.productCost}
                        onChange={(e) => setFormData({ ...formData, productCost: e.target.value })}
                        placeholder="80"
                        className="h-12 rounded-xl font-bold text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Selling Price (SLE)
                      </Label>
                      <Input
                        type="number"
                        value={formData.productPrice}
                        onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
                        placeholder="110"
                        className="h-12 rounded-xl font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Initial Stock Count
                      </Label>
                      <Input
                        type="number"
                        value={formData.productStock}
                        onChange={(e) => setFormData({ ...formData, productStock: e.target.value })}
                        placeholder="50"
                        className="h-12 rounded-xl font-bold text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        SKU / Barcode (Optional)
                      </Label>
                      <Input
                        value={formData.productSku}
                        onChange={(e) => setFormData({ ...formData, productSku: e.target.value })}
                        placeholder="AUTO-GENERATED"
                        className="h-12 rounded-xl font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: INVITE TEAM ──────────────────────────────── */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Step 4 of 5
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Invite Team & Staff
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Assign access levels for cashiers, stock managers, or accountants.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Staff Member Email
                    </Label>
                    <Input
                      value={formData.staffEmail}
                      onChange={(e) => setFormData({ ...formData, staffEmail: e.target.value })}
                      placeholder="cashier@yourbusiness.sl"
                      className="h-12 rounded-xl font-bold text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Assigned Role
                    </Label>
                    <Select 
                      value={formData.staffRole} 
                      onValueChange={(val) => setFormData({ ...formData, staffRole: val })}
                    >
                      <SelectTrigger className="h-12 rounded-xl font-bold text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="CASHIER" className="font-bold text-sm">Cashier (POS & Sales Only)</SelectItem>
                        <SelectItem value="MANAGER" className="font-bold text-sm">Manager (POS, Inventory, Customer Credit)</SelectItem>
                        <SelectItem value="ACCOUNTANT" className="font-bold text-sm">Accountant (Reports, P&L, Expenses)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <p className="text-xs text-slate-400 font-medium pt-2">
                    You can always add more staff, configure biometric shifts, and set custom permissions in the <strong>Staff & Permissions</strong> module.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STEP 5: LAUNCH ───────────────────────────────────── */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-4"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Your Operating System is Ready!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium leading-relaxed">
                    <strong>{formData.name || "Your Organization"}</strong> is fully provisioned on ProTech Assist Enterprise OS with multi-warehouse tracking and real-time POS.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Organization</span>
                    <span className="font-black text-slate-900 dark:text-white">{formData.name || "Enterprise"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Industry Archetype</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{formData.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Default Warehouse</span>
                    <span className="font-bold">{formData.defaultWarehouse}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Base Currency</span>
                    <span className="font-bold">{formData.currency}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {currentStep > 1 && currentStep < 5 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
            ) : <div />}

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <span>{currentStep === 3 && !formData.productName ? "Skip & Continue" : "Next Step"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={loading}
                className="w-full h-13 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/30 transition-transform hover:scale-105 active:scale-95"
              >
                {loading ? "Launching Workspace..." : "Enter Business Command Center"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
