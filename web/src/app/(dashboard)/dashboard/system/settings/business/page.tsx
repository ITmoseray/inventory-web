"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Building, Save, Globe, Smartphone, Store, ShieldCheck,
  Receipt, Sliders, Eye, Phone, MessageSquare, Mail, MapPin,
  CheckCircle2, Sparkles, AlertCircle, RefreshCw, Palette, Hash
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getCurrentBusiness, updateBusiness } from "@/lib/actions/business";
import { ImageUploader } from "@/components/ui/image-uploader";
import { uploadBusinessLogo } from "@/lib/actions/upload";
import { useRouter, useSearchParams } from "next/navigation";
import { ThermalReceipt } from "@/components/pos/ThermalReceipt";
import { cn } from "@/lib/utils";

export default function BusinessSettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "receipt" ? "receipt" : "profile";

  const [activeTab, setActiveTab] = useState<"profile" | "receipt">(initialTab);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    secondaryPhone: "",
    whatsappPhone: "",
    email: "",
    address: "",
    logoUrl: "",
    type: "",
    plan: "",
    receiptSettings: {
      headerTagline: "",
      footerMessage: "Thank you for your business!",
      returnPolicy: "* Returns accepted within 7 days with original receipt *",
      invoicePrefix: "TNSD",
      shopNameColor: "#4F46E5",
      showLogo: true,
      showAddress: true,
      showPhone: true,
      showSecondaryPhone: true,
      showWhatsapp: true,
      showEmail: false,
      showCashier: true,
      showCustomer: true,
      showQrCode: true,
      showPoweredBy: true,
      paperWidth: "80mm" as "58mm" | "80mm",
      // NRA Fiscal Compliance (SmartPay/ECR Standard)
      enableNraFiscalMode: false,
      taxIdentificationNumber: "1002934-8",
      nraDeviceId: "CIS-TNSD-001",
      gstRate: 15,
      taxInclusive: true,
      showGstBreakdown: true,
      showFiscalSignature: true,
      showNraQrCode: true,
    }
  });

  useEffect(() => {
    async function loadBusiness() {
      try {
        const business = await getCurrentBusiness();
        if (business) {
          const rawSettings = (business.receiptSettings as any) || {};
          const isTopNotch = (business.name || "").toLowerCase().includes("top notch");
          setFormData({
            name: business.name || "",
            phone: business.phone || "",
            secondaryPhone: (business as any).secondaryPhone || "",
            whatsappPhone: (business as any).whatsappPhone || "",
            email: business.email || "",
            address: business.address || "",
            logoUrl: business.logoUrl || "",
            type: business.type || "",
            plan: business.plan || "",
            receiptSettings: {
              headerTagline: rawSettings.headerTagline ?? "",
              footerMessage: rawSettings.footerMessage ?? "Thank you for your business!",
              returnPolicy: rawSettings.returnPolicy ?? "* Returns accepted within 7 days with original receipt *",
              invoicePrefix: rawSettings.invoicePrefix ?? (isTopNotch ? "TNSD" : "INV"),
              shopNameColor: rawSettings.shopNameColor ?? "#4F46E5",
              showLogo: rawSettings.showLogo ?? true,
              showAddress: rawSettings.showAddress ?? true,
              showPhone: rawSettings.showPhone ?? true,
              showSecondaryPhone: rawSettings.showSecondaryPhone ?? true,
              showWhatsapp: rawSettings.showWhatsapp ?? true,
              showEmail: rawSettings.showEmail ?? false,
              showCashier: rawSettings.showCashier ?? true,
              showCustomer: rawSettings.showCustomer ?? true,
              showQrCode: rawSettings.showQrCode ?? true,
              showPoweredBy: rawSettings.showPoweredBy ?? true,
              paperWidth: rawSettings.paperWidth ?? "80mm",
              // NRA Fiscal Settings
              enableNraFiscalMode: rawSettings.enableNraFiscalMode ?? false,
              taxIdentificationNumber: rawSettings.taxIdentificationNumber ?? (business.taxId || "1002934-8"),
              nraDeviceId: rawSettings.nraDeviceId ?? (isTopNotch ? "CIS-TNSD-001" : "CIS-POS-001"),
              gstRate: rawSettings.gstRate ?? 15,
              taxInclusive: rawSettings.taxInclusive ?? true,
              showGstBreakdown: rawSettings.showGstBreakdown ?? true,
              showFiscalSignature: rawSettings.showFiscalSignature ?? true,
              showNraQrCode: rawSettings.showNraQrCode ?? true,
            }
          });
        }
      } catch (error) {
        console.error("Failed to load business details", error);
        toast.error("Failed to load business details");
      } finally {
        setInitialLoading(false);
      }
    }
    loadBusiness();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateBusiness({
        name: formData.name,
        phone: formData.phone,
        secondaryPhone: formData.secondaryPhone,
        whatsappPhone: formData.whatsappPhone,
        email: formData.email,
        address: formData.address,
        logoUrl: formData.logoUrl,
        receiptSettings: formData.receiptSettings
      });
      
      if (result.success) {
        toast.success("Business profile & receipt settings updated successfully!");
        await update();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update business settings");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update business settings");
    } finally {
      setLoading(false);
    }
  };

  const sampleReceiptItems = [
    { name: "Sample Item Alpha", quantity: 2, price: 50 },
    { name: "Sample Item Beta", quantity: 1, price: 120 },
  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-3 sm:p-6 md:p-8 lg:p-12 pb-32 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">Business &amp; Receipt Settings</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Manage contact numbers, identity &amp; receipt customization</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard/system/settings")} className="h-10 rounded-xl">
             Back to Settings
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0",
              activeTab === "profile"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Building className="h-4 w-4" /> Organization &amp; Contacts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("receipt")}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0",
              activeTab === "receipt"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Receipt className="h-4 w-4" /> Receipt Customization &amp; Layout
          </button>
        </div>

        <form onSubmit={handleUpdate}>
          {/* TAB 1: PROFILE & CONTACT NUMBERS */}
          {activeTab === "profile" && (
            <div className="grid gap-8 md:grid-cols-3">
              {/* Business Info Summary Card */}
              <Card className="md:col-span-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-[2rem] overflow-hidden h-fit">
                 <div className="h-24 bg-indigo-600 relative">
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-20 w-20 rounded-2xl bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-950 flex items-center justify-center shadow-lg overflow-hidden">
                       {formData.logoUrl ? (
                         <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                       ) : (
                         <Building className="h-10 w-10 text-indigo-600" />
                       )}
                    </div>
                 </div>
                 <CardContent className="pt-14 pb-8 text-center space-y-4">
                    <div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{formData.name || "N/A"}</h3>
                       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 text-[10px] font-black uppercase tracking-widest mt-2 border border-indigo-100 dark:border-indigo-900/50">
                          <Store className="h-3 w-3" />
                          {formData.type || "BUSINESS"}
                       </div>
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
                       <div className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Primary Phone</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formData.phone || "Not set"}</span>
                       </div>
                       {formData.secondaryPhone && (
                         <div className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Secondary Phone</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formData.secondaryPhone}</span>
                         </div>
                       )}
                       {formData.whatsappPhone && (
                         <div className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">WhatsApp Line</span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formData.whatsappPhone}</span>
                         </div>
                       )}
                       <div className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Business Address</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formData.address || "Not set"}</span>
                       </div>
                    </div>
                 </CardContent>
              </Card>

              {/* Edit Form */}
              <Card className="md:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-[2rem]">
                 <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                       <Globe className="h-5 w-5 text-indigo-500" />
                       <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Business &amp; Contact Details</CardTitle>
                    </div>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Manage all phone numbers and public contact info</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-4 space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Business Name</Label>
                       <Input 
                         type="text" 
                         required
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                         placeholder="Top Notch Drinks Closet"
                       />
                    </div>

                    {/* Multiple Phone Numbers Section */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <Phone className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Phone Numbers (Printed on Receipts)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Phone</Label>
                           <Input 
                             type="text" 
                             value={formData.phone}
                             onChange={(e) => setFormData({...formData, phone: e.target.value})}
                             className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                             placeholder="+232 79 373838"
                           />
                        </div>

                        <div className="space-y-1.5">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secondary / Alternate Phone</Label>
                           <Input 
                             type="text" 
                             value={formData.secondaryPhone}
                             onChange={(e) => setFormData({...formData, secondaryPhone: e.target.value})}
                             className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                             placeholder="+232 77 000000"
                           />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">WhatsApp / Customer Support Line</Label>
                           <Input 
                             type="text" 
                             value={formData.whatsappPhone}
                             onChange={(e) => setFormData({...formData, whatsappPhone: e.target.value})}
                             className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                             placeholder="+232 79 373838 (WhatsApp)"
                           />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Official Email</Label>
                         <Input 
                           type="email" 
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                           className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                           placeholder="contact@business.com"
                         />
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Business Address</Label>
                         <Input 
                           type="text" 
                           value={formData.address}
                           onChange={(e) => setFormData({...formData, address: e.target.value})}
                           className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                           placeholder="17 Wilkinson road, Freetown"
                         />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Business Logo</Label>
                       <ImageUploader 
                         value={formData.logoUrl} 
                         onChange={(url) => setFormData({...formData, logoUrl: url})} 
                         uploadAction={uploadBusinessLogo} 
                         label="Upload Organization Logo"
                       />
                    </div>

                    <div className="pt-6 flex justify-end">
                       <Button 
                         type="submit"
                         disabled={loading}
                         className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 gap-2"
                       >
                          {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                          Save Organization Changes
                       </Button>
                    </div>
                 </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 2: RECEIPT CUSTOMIZATION & LIVE PREVIEW */}
          {activeTab === "receipt" && (
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Controls Column */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-[2rem]">
                  <CardHeader className="p-6 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="h-5 w-5 text-indigo-500" />
                      <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Receipt Content &amp; Header</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-slate-500">Customize how your printed and digital receipts look</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-3 space-y-4">
                    {/* Header Tagline */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Header Tagline / Slogan</Label>
                      <Input
                        type="text"
                        value={formData.receiptSettings.headerTagline}
                        onChange={(e) => setFormData({
                          ...formData,
                          receiptSettings: { ...formData.receiptSettings, headerTagline: e.target.value }
                        })}
                        placeholder="e.g. Best Quality Drinks &amp; Liquors in Town"
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-800 font-medium text-xs"
                      />
                    </div>

                    {/* Receipt / Invoice Prefix (Sequence Numbering) */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-indigo-500" /> Receipt / Invoice Prefix
                        </Label>
                        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                          Format: {(formData.receiptSettings.invoicePrefix || (formData.name?.toLowerCase().includes("top notch") ? "TNSD" : "INV")).toUpperCase()}-2026-0001
                        </span>
                      </div>
                      <Input
                        type="text"
                        value={formData.receiptSettings.invoicePrefix}
                        onChange={(e) => setFormData({
                          ...formData,
                          receiptSettings: { 
                            ...formData.receiptSettings, 
                            invoicePrefix: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") 
                          }
                        })}
                        placeholder="e.g. TNSD, INV, POS, SALES"
                        maxLength={10}
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-xs"
                      />
                      <p className="text-[10px] text-slate-400 font-medium">
                        Custom prefix for receipt &amp; invoice numbers. Increments sequentially: <strong className="text-slate-600 dark:text-slate-300">{(formData.receiptSettings.invoicePrefix || (formData.name?.toLowerCase().includes("top notch") ? "TNSD" : "INV")).toUpperCase()}-2026-0001</strong>, <strong className="text-slate-600 dark:text-slate-300">{(formData.receiptSettings.invoicePrefix || (formData.name?.toLowerCase().includes("top notch") ? "TNSD" : "INV")).toUpperCase()}-2026-0002</strong>...
                      </p>
                    </div>

                    {/* Shop Name Brand Color on Receipt */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <Palette className="h-3.5 w-3.5 text-indigo-500" /> Shop Name Color on Receipt
                        </Label>
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: formData.receiptSettings.shopNameColor || "#4F46E5" }}
                          />
                          <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                            {formData.receiptSettings.shopNameColor || "#4F46E5"}
                          </span>
                        </div>
                      </div>

                      {/* Color Swatches Grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {[
                          { name: "Indigo", hex: "#4F46E5" },
                          { name: "Emerald", hex: "#059669" },
                          { name: "Rose", hex: "#E11D48" },
                          { name: "Ocean", hex: "#0284C7" },
                          { name: "Amber", hex: "#D97706" },
                          { name: "Purple", hex: "#7C3AED" },
                          { name: "Teal", hex: "#0D9488" },
                          { name: "Dark Slate", hex: "#0F172A" },
                        ].map((preset) => {
                          const isSelected = (formData.receiptSettings.shopNameColor || "#4F46E5").toLowerCase() === preset.hex.toLowerCase();
                          return (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                receiptSettings: { ...formData.receiptSettings, shopNameColor: preset.hex }
                              })}
                              className={cn(
                                "h-10 rounded-xl border flex flex-col items-center justify-center p-1 transition-all relative group cursor-pointer",
                                isSelected 
                                  ? "border-slate-900 dark:border-white ring-2 ring-indigo-500 scale-105 shadow-md bg-slate-50 dark:bg-slate-800" 
                                  : "border-slate-200 dark:border-slate-800 hover:scale-102 hover:border-slate-300"
                              )}
                              title={preset.name}
                            >
                              <div 
                                className="h-4 w-4 rounded-full border border-black/10 shadow-inner"
                                style={{ backgroundColor: preset.hex }}
                              />
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter truncate w-full text-center mt-0.5">
                                {preset.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Color Input */}
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="color"
                            value={formData.receiptSettings.shopNameColor || "#4F46E5"}
                            onChange={(e) => setFormData({
                              ...formData,
                              receiptSettings: { ...formData.receiptSettings, shopNameColor: e.target.value }
                            })}
                            className="h-10 w-12 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer bg-white dark:bg-slate-900 p-1"
                            title="Pick Custom Color"
                          />
                          <Input
                            type="text"
                            value={formData.receiptSettings.shopNameColor || "#4F46E5"}
                            onChange={(e) => setFormData({
                              ...formData,
                              receiptSettings: { ...formData.receiptSettings, shopNameColor: e.target.value }
                            })}
                            placeholder="#4F46E5"
                            maxLength={7}
                            className="h-10 rounded-xl border-slate-200 dark:border-slate-800 font-mono text-xs font-bold uppercase"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Custom Hex Color
                        </span>
                      </div>
                    </div>

                    {/* Thank You Note */}
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Footer Thank You Message</Label>
                      <Input
                        type="text"
                        value={formData.receiptSettings.footerMessage}
                        onChange={(e) => setFormData({
                          ...formData,
                          receiptSettings: { ...formData.receiptSettings, footerMessage: e.target.value }
                        })}
                        placeholder="e.g. Thank you for shopping with us! Please come again."
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-800 font-medium text-xs"
                      />
                    </div>

                    {/* Return Policy */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Return Policy / Terms Note</Label>
                      <Textarea
                        rows={2}
                        value={formData.receiptSettings.returnPolicy}
                        onChange={(e) => setFormData({
                          ...formData,
                          receiptSettings: { ...formData.receiptSettings, returnPolicy: e.target.value }
                        })}
                        placeholder="e.g. * Returns accepted within 7 days with original receipt *"
                        className="rounded-xl border-slate-200 dark:border-slate-800 font-medium text-xs resize-none"
                      />
                    </div>

                    {/* Paper Width */}
                    <div className="space-y-1.5 pt-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Receipt Paper Width</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            receiptSettings: { ...formData.receiptSettings, paperWidth: "80mm" }
                          })}
                          className={cn(
                            "p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer",
                            formData.receiptSettings.paperWidth === "80mm"
                              ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600"
                              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          Standard Thermal (80mm)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            receiptSettings: { ...formData.receiptSettings, paperWidth: "58mm" }
                          })}
                          className={cn(
                            "p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer",
                            formData.receiptSettings.paperWidth === "58mm"
                              ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600"
                              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          Compact Thermal (58mm)
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* NRA 15% GST FISCAL COMPLIANCE CARD (SmartPay / ECR Standard) */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-[2rem] overflow-hidden border-2 border-indigo-500/20">
                  <div className="bg-gradient-to-r from-emerald-600 to-indigo-600 p-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-wider leading-tight">
                          NRA 15% GST &amp; Fiscal Compliance
                        </h4>
                        <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest">
                          National Revenue Authority (EBITAS / ECR SmartPay Standard)
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
                      <span className="text-[10px] font-black uppercase tracking-wider">Enable NRA Mode</span>
                      <input
                        type="checkbox"
                        checked={formData.receiptSettings.enableNraFiscalMode ?? false}
                        onChange={(e) => setFormData({
                          ...formData,
                          receiptSettings: {
                            ...formData.receiptSettings,
                            enableNraFiscalMode: e.target.checked
                          }
                        })}
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* TIN Number */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Taxpayer TIN (Tax Identification No.)
                        </Label>
                        <Input
                          type="text"
                          value={formData.receiptSettings.taxIdentificationNumber || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            receiptSettings: {
                              ...formData.receiptSettings,
                              taxIdentificationNumber: e.target.value
                            }
                          })}
                          placeholder="e.g. 1002934-8"
                          className="h-11 rounded-xl border-slate-200 dark:border-slate-800 font-mono text-xs font-bold"
                        />
                        <span className="text-[9px] text-slate-400 font-medium block">
                          Official TIN issued by NRA Sierra Leone
                        </span>
                      </div>

                      {/* ECR / CIS Device Identifier */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          NRA CIS / ECR Device ID
                        </Label>
                        <Input
                          type="text"
                          value={formData.receiptSettings.nraDeviceId || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            receiptSettings: {
                              ...formData.receiptSettings,
                              nraDeviceId: e.target.value
                            }
                          })}
                          placeholder="e.g. CIS-TNSD-001 or FSDU-8921"
                          className="h-11 rounded-xl border-slate-200 dark:border-slate-800 font-mono text-xs font-bold"
                        />
                        <span className="text-[9px] text-slate-400 font-medium block">
                          Certified Invoicing System / Fiscal Device ID
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {/* GST Rate */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          GST Tax Rate (%)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.receiptSettings.gstRate ?? 15}
                          onChange={(e) => setFormData({
                            ...formData,
                            receiptSettings: {
                              ...formData.receiptSettings,
                              gstRate: parseFloat(e.target.value) || 15
                            }
                          })}
                          className="h-11 rounded-xl border-slate-200 dark:border-slate-800 font-mono text-xs font-bold"
                        />
                        <span className="text-[9px] text-slate-400 font-medium block">
                          Sierra Leone Standard Rate = 15%
                        </span>
                      </div>

                      {/* Tax Inclusive / Exclusive */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Tax Pricing Model
                        </Label>
                        <select
                          value={formData.receiptSettings.taxInclusive ? "inclusive" : "exclusive"}
                          onChange={(e) => setFormData({
                            ...formData,
                            receiptSettings: {
                              ...formData.receiptSettings,
                              taxInclusive: e.target.value === "inclusive"
                            }
                          })}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold cursor-pointer"
                        >
                          <option value="inclusive">GST Included in Prices (Standard Retail)</option>
                          <option value="exclusive">GST Added on Top (+15%)</option>
                        </select>
                        <span className="text-[9px] text-slate-400 font-medium block">
                          How tax is calculated at checkout
                        </span>
                      </div>
                    </div>

                    {/* Fiscal Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                      <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 cursor-pointer">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">15% GST Table</span>
                        <input
                          type="checkbox"
                          checked={formData.receiptSettings.showGstBreakdown ?? true}
                          onChange={(e) => setFormData({
                            ...formData,
                            receiptSettings: {
                              ...formData.receiptSettings,
                              showGstBreakdown: e.target.checked
                            }
                          })}
                          className="h-4 w-4 rounded text-indigo-600"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 cursor-pointer">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">SDC Signature</span>
                        <input
                          type="checkbox"
                          checked={formData.receiptSettings.showFiscalSignature ?? true}
                          onChange={(e) => setFormData({
                            ...formData,
                            receiptSettings: {
                              ...formData.receiptSettings,
                              showFiscalSignature: e.target.checked
                            }
                          })}
                          className="h-4 w-4 rounded text-indigo-600"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 cursor-pointer">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">NRA Verify QR</span>
                        <input
                          type="checkbox"
                          checked={formData.receiptSettings.showNraQrCode ?? true}
                          onChange={(e) => setFormData({
                            ...formData,
                            receiptSettings: {
                              ...formData.receiptSettings,
                              showNraQrCode: e.target.checked
                            }
                          })}
                          className="h-4 w-4 rounded text-indigo-600"
                        />
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Display Toggles */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-[2rem]">
                  <CardHeader className="p-6 pb-3">
                    <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Display Options</CardTitle>
                    <CardDescription className="text-xs text-slate-500">Toggle elements on or off</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "showLogo", label: "Show Logo on Receipt" },
                        { key: "showAddress", label: "Show Business Address" },
                        { key: "showPhone", label: "Show Primary Phone" },
                        { key: "showSecondaryPhone", label: "Show Secondary Phone" },
                        { key: "showWhatsapp", label: "Show WhatsApp Line" },
                        { key: "showEmail", label: "Show Official Email" },
                        { key: "showCashier", label: "Show Cashier Name" },
                        { key: "showCustomer", label: "Show Customer Name" },
                        { key: "showQrCode", label: "Show Digital QR Code" },
                        { key: "showPoweredBy", label: "Show Powered By Tag" },
                      ].map((item) => {
                        const isChecked = (formData.receiptSettings as any)[item.key] ?? true;
                        return (
                          <label
                            key={item.key}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 cursor-pointer transition-all"
                          >
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => setFormData({
                                ...formData,
                                receiptSettings: {
                                  ...formData.receiptSettings,
                                  [item.key]: e.target.checked
                                }
                              })}
                              className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </label>
                        );
                      })}
                    </div>

                    <div className="pt-6 flex justify-end">
                       <Button 
                         type="submit"
                         disabled={loading}
                         className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 gap-2"
                       >
                          {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                          Save Receipt Settings
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Preview Column */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8 self-start">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Live Thermal Receipt Preview</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time</span>
                </div>

                <div className="bg-slate-200/90 dark:bg-slate-950 p-2 sm:p-4 md:p-6 rounded-2xl sm:rounded-[2rem] shadow-inner flex flex-col items-center justify-center border border-slate-300 dark:border-slate-800 w-full overflow-x-auto">
                  <div className="shadow-2xl rounded-2xl w-full max-w-[280px] sm:max-w-[320px] mx-auto bg-white flex justify-center p-0 overflow-hidden">
                    <ThermalReceipt
                      id="DEMO-12345"
                      items={sampleReceiptItems}
                      total={220}
                      paid={250}
                      paymentMethod="CASH"
                      cashierName="John Tucker"
                      customerName="Melina Tamba"
                      transactionId={`${(formData.receiptSettings.invoicePrefix || (formData.name?.toLowerCase().includes("top notch") ? "TNSD" : "INV")).toUpperCase()}-2026-0001`}
                      businessName={formData.name || "Top Notch Sales & Distribution"}
                      businessAddress={formData.address || "17 Wilkinson road, Freetown"}
                      businessPhone={formData.phone || "+232 79 373838"}
                      businessSecondaryPhone={formData.secondaryPhone || undefined}
                      businessWhatsappPhone={formData.whatsappPhone || undefined}
                      businessEmail={formData.email || undefined}
                      logoUrl={formData.logoUrl || undefined}
                      receiptSettings={formData.receiptSettings}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
