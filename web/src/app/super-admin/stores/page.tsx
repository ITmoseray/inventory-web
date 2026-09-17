"use client";

import React, { useState, useEffect } from "react";
import { 
  Store, Globe, Eye, ShoppingCart, DollarSign, Search, 
  Power, ExternalLink, ShieldCheck, Filter, ArrowLeft, RefreshCw,
  Building2, Users, AlertCircle, Sparkles
} from "lucide-react";
import Link from "next/link";
import { getSuperAdminStores, superAdminToggleStoreStatus } from "@/lib/actions/store-builder";
import { toast } from "sonner";

export default function SuperAdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await getSuperAdminStores();
      setStores(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load ecosystem stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleToggleStatus = async (storeId: string, currentStatus: string) => {
    setActionLoadingId(storeId);
    const nextStatus = currentStatus === "PUBLISHED" ? "SUSPENDED" : "PUBLISHED";
    try {
      await superAdminToggleStoreStatus(storeId, nextStatus as any);
      setStores(prev => prev.map(s => s.id === storeId ? { ...s, status: nextStatus } : s));
      toast.success(`Store status updated to ${nextStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update store status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredStores = stores.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.business?.name && s.business.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStores = stores.length;
  const publishedStores = stores.filter(s => s.status === "PUBLISHED").length;
  const totalOrders = stores.reduce((acc, s) => acc + (s._count?.salesOrders || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link 
              href="/super-admin"
              className="p-1.5 rounded-xl border hover:bg-muted text-muted-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Store className="w-6 h-6 text-primary" />
              Ecosystem Storefronts Control
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Global monitoring, traffic analysis, and moderation of all tenant online storefronts across ProTech Assist OS.
          </p>
        </div>

        <button
          onClick={fetchStores}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-card border hover:bg-muted transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Registry
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Stores Created</span>
          <div className="text-3xl font-extrabold text-foreground mt-1">{totalStores}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Across all registered tenants</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Live Published Stores</span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{publishedStores}</div>
          <p className="text-[11px] text-emerald-600 mt-0.5">{((publishedStores / (totalStores || 1)) * 100).toFixed(0)}% ecosystem adoption</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Web Orders</span>
          <div className="text-3xl font-extrabold text-primary mt-1">{totalOrders}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Orders generated via online stores</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stores by name, URL slug, or tenant business..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center bg-muted/60 p-1 rounded-xl border text-xs font-medium">
          {["ALL", "PUBLISHED", "DRAFT", "SUSPENDED"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === st ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="py-3.5 px-4">Store & Web Link</th>
                <th className="py-3.5 px-4">Tenant Business</th>
                <th className="py-3.5 px-4 text-center">Products</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading stores...
                  </td>
                </tr>
              ) : filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No store matching your criteria found.
                  </td>
                </tr>
              ) : (
                filteredStores.map(store => (
                  <tr key={store.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground">{store.name}</div>
                      <a
                        href={`/store/${store.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary font-mono hover:underline"
                      >
                        /store/{store.slug}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{store.business?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {store.business?.address || "Freetown"} • {store.business?.type || "Retail"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-medium">
                      {store._count?.products || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {store._count?.salesOrders || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        store.status === "PUBLISHED" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : store.status === "SUSPENDED"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}>
                        {store.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {new Date(store.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(store.id, store.status)}
                        disabled={actionLoadingId === store.id}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                          store.status === "PUBLISHED"
                            ? "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                        }`}
                      >
                        {actionLoadingId === store.id 
                          ? "Saving..." 
                          : store.status === "PUBLISHED" 
                            ? "Suspend Store" 
                            : "Activate / Publish"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
