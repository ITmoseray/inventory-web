"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  Sparkles, 
  Check, 
  Store as StoreIcon, 
  Building2, 
  Smartphone, 
  Mail, 
  Palette, 
  ArrowRight,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { StoreTemplateDTO, CreateStoreFromTemplateInput } from "@/types/store-builder";
import { createStoreFromTemplateAction } from "@/lib/actions/store-builder";

interface Props {
  template: StoreTemplateDTO;
  isOpen: boolean;
  onClose: () => void;
  hasEnterpriseAccount?: boolean;
  userBusinessName?: string;
}

export function TemplateCustomizeModal({
  template,
  isOpen,
  onClose,
  hasEnterpriseAccount = false,
  userBusinessName = "",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [businessName, setBusinessName] = useState(userBusinessName || "");
  const [description, setDescription] = useState(template.description || "");
  const [storeType, setStoreType] = useState<"ENTERPRISE_CONNECTED" | "STANDALONE">(
    hasEnterpriseAccount ? "ENTERPRISE_CONNECTED" : "STANDALONE"
  );
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("SLE");
  
  // Custom theme colors initialized to template defaults
  const [primaryColor, setPrimaryColor] = useState(template.themeConfig.colors.primary);
  const [secondaryColor, setSecondaryColor] = useState(template.themeConfig.colors.secondary);
  const [accentColor, setAccentColor] = useState(template.themeConfig.colors.accent);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError("Please provide a business or store name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const input: CreateStoreFromTemplateInput = {
        templateId: template.templateId,
        businessName: businessName.trim(),
        businessType: template.category,
        description: description.trim(),
        whatsapp: whatsapp.trim(),
        phone: whatsapp.trim(),
        email: email.trim(),
        currency,
        storeType,
        customColors: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor,
        },
      };

      const result = await createStoreFromTemplateAction(input);

      if (result.success && result.storeId) {
        onClose();
        router.push(`/dashboard/store-builder?store=${result.storeId}&tab=studio`);
      } else {
        setError(result.error || "Failed to create store from template.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md font-bold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Use Template: {template.name}
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {template.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Setup your online store in seconds with this pre-configured design
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-sm text-rose-600 dark:text-rose-300 flex items-center gap-2">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Store Architecture Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              1. Choose Store Architecture
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStoreType("STANDALONE")}
                className={`flex flex-col text-left p-3.5 rounded-xl border-2 transition-all ${
                  storeType === "STANDALONE"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <StoreIcon className="w-4 h-4 text-indigo-600" />
                    Standalone Online Store
                  </div>
                  {storeType === "STANDALONE" && (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instant independent shop with its own starter catalog. No Enterprise OS setup required.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStoreType("ENTERPRISE_CONNECTED")}
                className={`flex flex-col text-left p-3.5 rounded-xl border-2 transition-all ${
                  storeType === "ENTERPRISE_CONNECTED"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    Connect Enterprise OS
                  </div>
                  {storeType === "ENTERPRISE_CONNECTED" && (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Syncs live inventory and products from your existing Enterprise OS company account.
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Business Information */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Business Details
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Store or Business Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Sierra Luxe Collections"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Store Tagline or Short Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe your products or specialty..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  WhatsApp Orders Number
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. +232 79 123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Contact Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@mystore.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Brand Palette Customization */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              3. Customize Colors (Optional)
            </label>
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                    {primaryColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                    {secondaryColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                    {accentColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantee Pill */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>
              Includes responsive mobile layouts, automated WhatsApp checkout button, and full visual editor access.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !businessName.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Storefront...
                </>
              ) : (
                <>
                  Create My Online Store
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
