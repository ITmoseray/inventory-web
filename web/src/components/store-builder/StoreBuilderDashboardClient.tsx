"use client";

import React, { useState } from "react";
import { 
  Store as StoreIcon, Sparkles, Globe, Eye, Palette, ShoppingBag, 
  Settings, BarChart3, ExternalLink, Copy, Check, Power, RefreshCw,
  PlusCircle, Layers, ArrowRight
} from "lucide-react";
import { StoreWizard } from "./StoreWizard";
import { StoreStudio } from "./StoreStudio";
import { StoreProductsManager } from "./StoreProductsManager";
import { StoreOrdersManager } from "./StoreOrdersManager";
import { StoreAnalyticsView } from "./StoreAnalyticsView";
import { StoreSettingsManager } from "./StoreSettingsManager";
import { toggleStorePublish } from "@/lib/actions/store-builder";
import Link from "next/link";
import { toast } from "sonner";

interface Props {
  initialStore: any;
  availableProducts: any[];
  curatedProducts: any[];
  orders: any[];
  analytics: any;
  businessName: string;
}

export function StoreBuilderDashboardClient({
  initialStore,
  availableProducts = [],
  curatedProducts = [],
  orders = [],
  analytics,
  businessName
}: Props) {
  const [store, setStore] = useState(initialStore);
  const [activeTab, setActiveTab] = useState<"analytics" | "studio" | "products" | "orders" | "settings">("analytics");
  const [showWizard, setShowWizard] = useState(!initialStore);
  const [copied, setCopied] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // If user has no store, show the AI Store Wizard to create one
  if (!store || showWizard) {
    return (
      <div className="space-y-6">
        {store && (
          <div className="flex items-center justify-between bg-card border rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              You already have a store created (<span className="font-bold text-foreground">{store.name}</span>).
            </p>
            <button
              onClick={() => setShowWizard(false)}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl border hover:bg-muted transition-colors"
            >
              Return to Store Workspace
            </button>
          </div>
        )}
        <StoreWizard 
          availableProducts={availableProducts}
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
      {/* Top Banner & Quick Controls */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
            <StoreIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                {store.name}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isPublished 
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {store.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-mono">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>/store/{store.slug}</span>
            </div>
          </div>
        </div>

        {/* Global Storefront Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-muted/60 border hover:bg-muted text-foreground transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Link"}
          </button>

          <Link
            href={`/store/${store.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-card border hover:bg-muted text-foreground transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Live Preview
          </Link>

          <button
            onClick={handleTogglePublish}
            disabled={isTogglingStatus}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm ${
              isPublished 
                ? "bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20" 
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {isTogglingStatus ? "Updating..." : isPublished ? "Unpublish to Draft" : "Publish Live Store"}
          </button>

          <button
            onClick={() => setShowWizard(true)}
            title="Re-run AI creation wizard"
            className="p-2 rounded-xl border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b text-xs font-semibold">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "analytics"
              ? "bg-primary text-primary-foreground shadow-sm"
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
              ? "bg-primary text-primary-foreground shadow-sm"
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
              ? "bg-primary text-primary-foreground shadow-sm"
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
              ? "bg-primary text-primary-foreground shadow-sm"
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
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Settings className="w-4 h-4" />
          Store Settings & WhatsApp
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
          <StoreSettingsManager store={store} />
        )}
      </div>
    </div>
  );
}
