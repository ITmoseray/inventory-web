"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Edit,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Smartphone,
  MousePointerClick,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { SimulatorNoticeBanner } from "./SimulatorNoticeBanner";
import {
  getAdminSimulatorData,
  createTrainingProduct,
  updateTrainingProduct,
  setTrainingProductStatus,
  createTrainingCampaign,
  approveDemoCommission,
  cancelDemoCommission,
  seedDemoProductsIfEmpty,
} from "@/lib/actions/affiliate-simulator";

export function AdminSimulatorManager() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subTab, setSubTab] = useState<"products" | "orders" | "commissions" | "campaigns" | "students">("products");

  // Product modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "LAPTOPS",
    price: 8500,
    demoStock: 25,
    commissionPct: 10,
    description: "",
    imageUrl: "",
    status: "published",
    campaignId: "",
  });

  // Campaign modal
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    targetGroup: "Class of October 2026",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  // Commission cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetCommission, setTargetCommission] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAffiliate, setFilterAffiliate] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await seedDemoProductsIfEmpty();
      const res = await getAdminSimulatorData();
      if (res.success) {
        setData(res);
      } else {
        toast.error(res.error || "Failed to load simulation operations data.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Network error fetching simulator operations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    toast.success("Simulation telemetry re-synchronized!");
  };

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: "LAPTOPS",
      price: 1500,
      demoStock: 50,
      commissionPct: 10,
      description: "",
      imageUrl: "",
      status: "published",
      campaignId: data?.campaigns?.[0]?.id || "",
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category || "GENERAL",
      price: p.price,
      demoStock: p.demoStock,
      commissionPct: p.commissionPct,
      description: p.description || "",
      imageUrl: p.imageUrl || "",
      status: p.status,
      campaignId: p.campaignId || "",
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      toast.error("Please enter a product name.");
      return;
    }

    try {
      if (editingProduct) {
        const res = await updateTrainingProduct(editingProduct.id, {
          name: productForm.name,
          category: productForm.category,
          price: Number(productForm.price),
          demoStock: Number(productForm.demoStock),
          commissionPct: Number(productForm.commissionPct),
          description: productForm.description,
          imageUrl: productForm.imageUrl,
          status: productForm.status,
          campaignId: productForm.campaignId || null,
        });
        if (res.success) {
          toast.success("Training product updated successfully!");
          setProductModalOpen(false);
          loadData();
        } else {
          toast.error(res.error || "Failed to update product.");
        }
      } else {
        const res = await createTrainingProduct({
          name: productForm.name,
          category: productForm.category,
          price: Number(productForm.price),
          demoStock: Number(productForm.demoStock),
          commissionPct: Number(productForm.commissionPct),
          description: productForm.description,
          imageUrl: productForm.imageUrl,
          status: productForm.status,
          campaignId: productForm.campaignId || null,
        });
        if (res.success) {
          toast.success("New training product created and published to students!");
          setProductModalOpen(false);
          loadData();
        } else {
          toast.error(res.error || "Failed to create product.");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save product.");
    }
  };

  const handleToggleProductStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const res = await setTrainingProductStatus(id, newStatus as any);
    if (res.success) {
      toast.success(`Product status changed to: ${newStatus.toUpperCase()}`);
      loadData();
    } else {
      toast.error(res.error || "Failed to change status.");
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.name.trim()) {
      toast.error("Please enter a campaign name.");
      return;
    }
    const res = await createTrainingCampaign(campaignForm);
    if (res.success) {
      toast.success("New training practical campaign created!");
      setCampaignModalOpen(false);
      loadData();
    } else {
      toast.error(res.error || "Failed to create campaign.");
    }
  };

  const handleApproveCommission = async (id: string) => {
    const res = await approveDemoCommission(id);
    if (res.success) {
      toast.success("Demonstration commission approved! Student notified.");
      loadData();
    } else {
      toast.error(res.error || "Failed to approve commission.");
    }
  };

  const handleOpenCancelCommission = (comm: any) => {
    setTargetCommission(comm);
    setCancelReason("Test order cancelled during practical training session");
    setCancelModalOpen(true);
  };

  const handleConfirmCancelCommission = async () => {
    if (!targetCommission || !cancelReason.trim()) return;
    const res = await cancelDemoCommission(targetCommission.id, cancelReason);
    if (res.success) {
      toast.success("Demonstration commission cancelled. Audit record and student notification sent.");
      setCancelModalOpen(false);
      loadData();
    } else {
      toast.error(res.error || "Failed to cancel commission.");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Loading Simulator Telemetry & Products...
        </p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalProducts: 0,
    totalAffiliates: 0,
    totalLinks: 0,
    totalClicks: 0,
    totalOrders: 0,
    totalSimulatedSales: 0,
    totalCommissionsCalculated: 0,
    totalApprovedCommissions: 0,
  };

  const products = data?.products || [];
  const orders = data?.orders || [];
  const commissions = data?.commissions || [];
  const campaigns = data?.campaigns || [];
  const affiliates = data?.affiliates || [];

  // Filtered orders
  const filteredOrders = orders.filter((o: any) => {
    if (filterAffiliate !== "ALL" && o.affiliate?.id !== filterAffiliate) return false;
    if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        o.orderRef?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.productName?.toLowerCase().includes(q) ||
        o.paymentRef?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Banner */}
      <SimulatorNoticeBanner />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider">
              Instructor Command Deck
            </span>
            <span className="text-xs font-bold text-slate-500">Live Academy Simulator Control</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Affiliate Practical Simulator Operations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create demonstration products, configure campaigns, monitor simulated customer visits & Orange Money checkouts, and approve practice commissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Sync
          </button>
          <button
            onClick={handleOpenCreateProduct}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Training Product
          </button>
        </div>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Training Products</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalProducts}</div>
          <span className="text-[10px] text-emerald-600 font-bold">Catalog items</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Students</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalAffiliates}</div>
          <span className="text-[10px] text-blue-600 font-bold">Enrolled partners</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Tracked Clicks</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalClicks}</div>
          <span className="text-[10px] text-purple-600 font-bold">Traffic visits</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Demo Purchases</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalOrders}</div>
          <span className="text-[10px] text-amber-600 font-bold">Completed orders</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Simulated GMV</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            NLe {stats.totalSimulatedSales.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">Training volume</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Demo Commissions</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">
            NLe {stats.totalApprovedCommissions.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 font-bold">Approved demo total</span>
        </div>
      </div>

      {/* Operations Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setSubTab("products")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "products"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Package className="h-4 w-4" />
          Training Products ({products.length})
        </button>

        <button
          onClick={() => setSubTab("orders")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "orders"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Simulated Orders ({orders.length})
        </button>

        <button
          onClick={() => setSubTab("commissions")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "commissions"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Commission Ledger ({commissions.length})
        </button>

        <button
          onClick={() => setSubTab("campaigns")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "campaigns"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Calendar className="h-4 w-4" />
          Practical Campaigns ({campaigns.length})
        </button>

        <button
          onClick={() => setSubTab("students")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "students"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          Student Performance ({affiliates.length})
        </button>
      </div>

      {/* SUBTAB 1: PRODUCTS MANAGEMENT */}
      {subTab === "products" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Demonstration Products Catalog
              </h3>
              <p className="text-xs text-slate-500">
                Products published here automatically appear in all student affiliate dashboards for link creation.
              </p>
            </div>
            <button
              onClick={handleOpenCreateProduct}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" /> Create Training Product
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Demo Stock</th>
                    <th className="py-3.5 px-4">Price (NLe)</th>
                    <th className="py-3.5 px-4">Comm. Rate</th>
                    <th className="py-3.5 px-4">Calculated Earning</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {products.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">slug: {p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">{p.demoStock} units</td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                        NLe {p.price.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">
                        {p.commissionPct}%
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">
                        NLe {p.calculatedCommission.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            p.status === "published"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : p.status === "draft"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-slate-500/15 text-slate-500"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleProductStatus(p.id, p.status)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                            title={p.status === "published" ? "Unpublish (Draft)" : "Publish to Marketplace"}
                          >
                            {p.status === "published" ? <Clock className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5 text-emerald-500" />}
                          </button>
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <Link
                            href={`/affiliate/simulator/shop/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                            title="Open Storefront View"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SIMULATED ORDERS & ORANGE MONEY */}
      {subTab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Simulated Customer Orders & Payment Records
              </h3>
              <p className="text-xs text-slate-500">
                Audit every demonstration order completed by customers using Orange Money simulation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by ref, customer, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Order Ref</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Orange Money Ref</th>
                    <th className="py-3.5 px-4">Attributed Affiliate</th>
                    <th className="py-3.5 px-4">Commission</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No demonstration orders recorded matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o: any) => (
                      <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          <Link
                            href={`/affiliate/simulator/checkout/confirmation/${o.orderRef}`}
                            target="_blank"
                            className="hover:underline flex items-center gap-1"
                          >
                            {o.orderRef}
                            <ExternalLink className="h-3 w-3 text-slate-400" />
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {o.customerName}
                          </span>
                          <span className="text-[10px] text-slate-400">{o.customerPhone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {o.productName} (x{o.quantity})
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                          NLe {o.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-orange-600 dark:text-orange-400">
                          {o.paymentRef}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">
                          {o.affiliate ? (
                            <span>{o.affiliate.fullName} ({o.affiliate.affiliateCode})</span>
                          ) : (
                            <span className="text-slate-400">Direct / None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-600">
                          {o.commission ? `NLe ${o.commission.amount.toLocaleString()}` : "N/A"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[10px]">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: COMMISSIONS LEDGER & APPROVALS */}
      {subTab === "commissions" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Demonstration Commission Ledger & Instructor Approvals
              </h3>
              <p className="text-xs text-slate-500">
                Audited practice commissions calculated from simulated purchases. You can approve or cancel with a logged reason.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Order Ref</th>
                    <th className="py-3.5 px-4">Affiliate Student</th>
                    <th className="py-3.5 px-4">Sale Amount</th>
                    <th className="py-3.5 px-4">Rate</th>
                    <th className="py-3.5 px-4">Demo Commission</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Audit Note</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No demonstration commissions in ledger yet.
                      </td>
                    </tr>
                  ) : (
                    commissions.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {c.orderRef}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {c.affiliate?.fullName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{c.affiliate?.affiliateCode}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          NLe {c.saleAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-600 dark:text-slate-300">
                          {c.commissionPct}%
                        </td>
                        <td className="py-3.5 px-4 font-black text-amber-600 dark:text-amber-400">
                          NLe {c.commissionAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              c.status === "APPROVED"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : c.status === "PENDING"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[10px] text-slate-400 max-w-xs">
                          {c.status === "APPROVED" && (
                            <span>Approved by {c.approvedBy}</span>
                          )}
                          {c.status === "CANCELLED" && (
                            <span className="text-rose-500">Cancelled by {c.cancelledBy}: {c.cancelReason}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status !== "APPROVED" && (
                              <button
                                onClick={() => handleApproveCommission(c.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {c.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleOpenCancelCommission(c)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold text-[10px] hover:bg-rose-600 cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: PRACTICAL CAMPAIGNS */}
      {subTab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Training Campaigns & Class Sessions
              </h3>
              <p className="text-xs text-slate-500">
                Organize practical sessions for different student cohorts or training dates.
              </p>
            </div>
            <button
              onClick={() => setCampaignModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" /> Create Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((c: any) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-black text-[9px] uppercase tracking-wider">
                      {c.status}
                    </span>
                    <h4 className="font-black text-base text-slate-900 dark:text-white mt-1">
                      {c.name}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Target: {c.targetGroup}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {c.description || "Interactive campaign practical session."}
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Start: {new Date(c.startDate).toLocaleDateString()}</span>
                  <span>Products: {c._count?.products || 0}</span>
                  <span>Clicks: {c._count?.demoClicks || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: STUDENT PERFORMANCE COMPARISON */}
      {subTab === "students" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Student Practical Performance Leaderboard
            </h3>
            <span className="text-xs text-slate-500">
              Real-time student progress in link sharing, visits, and sales.
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Affiliate Code</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Links Generated</th>
                    <th className="py-3.5 px-4">Tracked Clicks</th>
                    <th className="py-3.5 px-4">Demo Orders</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {affiliates.map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {a.fullName}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                        {a.affiliateCode}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{a.email}</td>
                      <td className="py-3.5 px-4 font-bold">{a._count?.trainingLinks || 0}</td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">{a._count?.demoClicks || 0}</td>
                      <td className="py-3.5 px-4 font-black text-purple-600">{a._count?.demoOrders || 0}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingProduct ? "Edit Training Product" : "Create Demonstration Product"}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ProTech Elite Laptop 15"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="LAPTOPS">Laptops</option>
                    <option value="SMARTPHONES">Smartphones</option>
                    <option value="ACCESSORIES">Accessories</option>
                    <option value="ELECTRONICS">Electronics</option>
                    <option value="SOFTWARE">Software & Courses</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Status</label>
                  <select
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="published">Published (Live for Students)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Price (NLe) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Comm. % *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={productForm.commissionPct}
                    onChange={(e) => setProductForm({ ...productForm, commissionPct: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Demo Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.demoStock}
                    onChange={(e) => setProductForm({ ...productForm, demoStock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Commission calculation preview */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                <span>Calculated Commission / Sale:</span>
                <span className="font-black text-sm">
                  NLe {Math.round((Number(productForm.price) * Number(productForm.commissionPct)) / 100).toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain the item features and specifications..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black cursor-pointer shadow-md"
                >
                  {editingProduct ? "Update Product" : "Save & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {campaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Create Practical Campaign</h3>
              <button
                onClick={() => setCampaignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveCampaign} className="space-y-3 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ProTech Academy Affiliate Practical — October 2026"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Target Student Group</label>
                <input
                  type="text"
                  placeholder="e.g. Class of Oct 2026 / Cohort 4"
                  value={campaignForm.targetGroup}
                  onChange={(e) => setCampaignForm({ ...campaignForm, targetGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Description</label>
                <textarea
                  rows={2}
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCampaignModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold">
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL COMMISSION REASON MODAL */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-rose-600">Cancel Demonstration Commission</h3>
              <button onClick={() => setCancelModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Provide an audit cancellation reason. This will update the ledger and notify affiliate{" "}
              <strong>{targetCommission?.affiliate?.fullName}</strong>.
            </p>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              >
                Keep Commission
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelCommission}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
