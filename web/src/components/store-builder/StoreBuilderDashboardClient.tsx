"use client";

import React, { useState } from "react";
import { 
  Store as StoreIcon, Sparkles, Globe, Eye, Palette, ShoppingBag, 
  Settings, BarChart3, ExternalLink, Copy, Check, Power, RefreshCw,
  PlusCircle, Layers, ArrowRight, Trash2, AlertOctagon, X, Wand2
} from "lucide-react";
import { StoreWizard } from "./StoreWizard";
import { StoreStudio } from "./StoreStudio";
import { StoreProductsManager } from "./StoreProductsManager";
import { StoreOrdersManager } from "./StoreOrdersManager";
import { StoreAnalyticsView } from "./StoreAnalyticsView";
import { StoreSettingsManager } from "./StoreSettingsManager";
import { toggleStorePublish, deleteStore } from "@/lib/actions/store-builder";
import Link from "next/link";
import { toast } from "sonner";

interface Props {
  initialStore: any;
  availableProducts: any[];
  curatedProducts: any[];
  orders: any[];
  analytics: any;
  businessName: string;
  initialPrompt?: string;
}

export function StoreBuilderDashboardClient({
  initialStore,
  availableProducts = [],
  curatedProducts = [],
  orders = [],
  analytics,
  businessName,
  initialPrompt
}: Props) {
  const [store, setStore] = useState(initialStore);
  const [activeTab, setActiveTab] = useState<"analytics" | "studio" | "products" | "orders" | "settings">("analytics");
  const [showWizard, setShowWizard] = useState(!initialStore || !!initialPrompt);
  const [copied, setCopied] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Top header delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStoreDeleted = () => {
    setStore(null);
    setShowWizard(true);
  };

  const handleDeleteStore = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== "delete") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteStore();
      toast.success("Online storefront deleted successfully. Resetting workspace.");
      setShowDeleteModal(false);
      handleStoreDeleted();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete store");
    } finally {
      setIsDeleting(false);
    }
  };

  // If user has no store or entered wizard mode, show the AI Store Wizard
  if (!store || showWizard) {
    return (
      <div className="space-y-6">
        {store && (
          <div className="flex items-center justify-between bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <StoreIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Active storefront loaded: <span className="font-bold text-primary">{store.name}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  You are currently in AI creation mode. You can return to your live store dashboard anytime.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowWizard(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all shadow-sm"
            >
              Return to Store Workspace
            </button>
          </div>
        )}
        <StoreWizard 
          availableProducts={availableProducts}
          initialPrompt={initialPrompt}
          onStoreCreated={(newStore) => {
            setStore(newStore);
            setShowWizard(false);
            toast.success("Welcome to your new AI Storefront!");
          }}
        />
      </div>
    );
  }

  const publicUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/store/${store.slug}` 
    : `/store/${store.slug}`;

  const isPublished = store.status === "PUBLISHED";

  const handleTogglePublish = async () => {
    setIsTogglingStatus(true);
    try {
      const res = await toggleStorePublish(!isPublished);
      setStore((prev: any) => ({ ...prev, status: res.status }));
      toast.success(!isPublished ? "Storefront is now live and published!" : "Storefront moved to Draft (hidden from shoppers)");
    } catch (err: any) {
      toast.error(err.message || "Failed to update publish status");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Storefront link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls with Executive Glassmorphic Polish */}
      <div className="relative overflow-hidden bg-card/90 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-7 shadow-md transition-all">
        {/* Subtle Ambient Accent Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary via-primary/90 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0">
              <StoreIcon className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {store.name}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  isPublished 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10" 
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isPublished ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  {store.status}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5 font-mono text-primary font-semibold">
                  <Globe className="w-3.5 h-3.5" />
                  <span>/store/{store.slug}</span>
                </div>
                <span className="text-border">•</span>
                <span>Currency: <strong className="text-foreground">{store.currency || "SLE"}</strong></span>
                <span className="text-border">•</span>
                <span>Online Items: <strong className="text-foreground">{curatedProducts.filter(p => p.isListedOnline).length}</strong></span>
              </div>
            </div>
          </div>

          {/* Global Storefront Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyLink}
              title="Copy public storefront link"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-background border border-border hover:bg-muted text-foreground transition-all shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              {copied ? "Copied Link" : "Copy Link"}
            </button>

            <Link
              href={`/store/${store.slug}`}
              target="_blank"
              title="Open customer-facing storefront in new tab"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-background border border-border hover:bg-muted text-foreground transition-all shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              Live Preview
            </Link>

            <button
              onClick={handleTogglePublish}
              disabled={isTogglingStatus}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm ${
                isPublished 
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {isTogglingStatus ? "Updating..." : isPublished ? "Unpublish to Draft" : "Publish Live Store"}
            </button>

            <button
              onClick={() => setShowWizard(true)}
              title="Re-run AI Store Creation Wizard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Wizard</span>
            </button>

            {/* Quick Delete Storefront Button */}
            <button
              onClick={() => {
                setDeleteConfirmText("");
                setShowDeleteModal(true);
              }}
              title="Delete storefront and start fresh"
              className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border/70 text-xs font-bold">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "analytics"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Overview & Traffic
        </button>

        <button
          onClick={() => setActiveTab("studio")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "studio"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Palette className="w-4 h-4" />
          Visual Studio & Sections
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "products"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Online Products ({curatedProducts.filter(p => p.isListedOnline).length})
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "orders"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Layers className="w-4 h-4" />
          Storefront Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "settings"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings & Danger Zone
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === "analytics" && (
          <StoreAnalyticsView 
            analytics={analytics} 
            currency={store.currency || "SLE"} 
            storeName={store.name} 
          />
        )}

        {activeTab === "studio" && (
          <StoreStudio 
            initialStore={store} 
            availableProducts={availableProducts} 
          />
        )}

        {activeTab === "products" && (
          <StoreProductsManager 
            initialProducts={curatedProducts} 
            currency={store.currency || "SLE"}
            storeSlug={store.slug}
          />
        )}

        {activeTab === "orders" && (
          <StoreOrdersManager 
            initialOrders={orders} 
            currency={store.currency || "SLE"}
            storeSlug={store.slug}
          />
        )}

        {activeTab === "settings" && (
          <StoreSettingsManager 
            store={store} 
            onStoreDeleted={handleStoreDeleted}
          />
        )}
      </div>

      {/* ── TOP BANNER DELETE MODAL ───────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black tracking-tight text-foreground">
                Delete &quot;{store.name}&quot;?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This will take down <span className="font-mono text-primary font-bold">/store/{store.slug}</span> and reset this dashboard so you can generate a fresh store with the AI wizard. Your catalog products, inventory stock, and POS sales are completely safe.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-foreground">
                Type <span className="font-mono text-red-600 font-black">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2.5 bg-background border rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border hover:bg-muted text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStore}
                disabled={deleteConfirmText.trim().toLowerCase() !== "delete" || isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-600/20"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
