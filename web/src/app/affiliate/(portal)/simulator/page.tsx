"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Share2,
  Copy,
  Check,
  TrendingUp,
  Users,
  MousePointerClick,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Bell,
  RefreshCw,
  QrCode,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Calendar,
  Zap,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { SimulatorNoticeBanner } from "@/components/affiliate/SimulatorNoticeBanner";
import {
  getMarketplaceProducts,
  generateTrainingLink,
  getMyTrainingLinks,
  getStudentSimulatorStats,
  markDemoNotificationRead,
  seedDemoProductsIfEmpty,
} from "@/lib/actions/affiliate-simulator";

export default function StudentSimulatorHubPage() {
  const [activeTab, setActiveTab] = useState<"marketplace" | "funnel" | "links" | "orders" | "notifications">("marketplace");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [products, setProducts] = useState<any[]>([]);
  const [myLinks, setMyLinks] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);

  // Link generation / copy state
  const [generatingProductId, setGeneratingProductId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("https://protechassist.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
    loadAllData();

    // Auto-poll telemetry every 12 seconds so students get live alerts during practical sessions
    const interval = setInterval(async () => {
      try {
        const [statsRes, linksRes] = await Promise.all([
          getStudentSimulatorStats(),
          getMyTrainingLinks(),
        ]);
        if (linksRes.success) setMyLinks(linksRes.links || []);
        if (statsRes.success) {
          setStatsData((prev: any) => {
            const prevUnread = prev?.recentNotifications?.filter((n: any) => !n.isRead).length || 0;
            const newUnread = statsRes.recentNotifications?.filter((n: any) => !n.isRead).length || 0;
            if (newUnread > prevUnread) {
              const latest = statsRes.recentNotifications?.[0];
              toast.success(
                latest?.title || "🎉 New Demo Sale! Simulated Commission Credited!",
                {
                  description: "A customer just completed a simulated purchase using your link!",
                  duration: 8000,
                }
              );
            }
            return statsRes;
          });
        }
      } catch (err) {
        // Silent background polling
      }
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);

      // Auto-seed default training products if empty
      await seedDemoProductsIfEmpty();

      const [productsRes, linksRes, statsRes] = await Promise.all([
        getMarketplaceProducts(),
        getMyTrainingLinks(),
        getStudentSimulatorStats(),
      ]);

      if (productsRes.success) setProducts(productsRes.products || []);
      if (linksRes.success) setMyLinks(linksRes.links || []);
      if (statsRes.success) setStatsData(statsRes);
    } catch (err: any) {
      console.error("Error loading simulator hub data", err);
      toast.error("Failed to load practical simulator data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    toast.success("Training simulator telemetry refreshed!");
  };

  const handleGenerateLink = async (productId: string) => {
    try {
      setGeneratingProductId(productId);
      const res = await generateTrainingLink(productId);
      if (res.success && res.link) {
        toast.success(res.message || "Demonstration affiliate link ready!");
        // Refresh links list and stats
        const [linksRes, statsRes] = await Promise.all([
          getMyTrainingLinks(),
          getStudentSimulatorStats(),
        ]);
        if (linksRes.success) setMyLinks(linksRes.links || []);
        if (statsRes.success) setStatsData(statsRes);
      } else {
        toast.error(res.error || "Failed to generate link.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error generating link.");
    } finally {
      setGeneratingProductId(null);
    }
  };

  const copyLinkUrl = (code: string, slug?: string) => {
    const targetSlug = slug || myLinks.find((l) => l.code === code)?.productSlug || "item";
    const fullUrl = `${baseUrl}/affiliate/simulator/shop/${targetSlug}?ref=${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(code);
    toast.success("Affiliate link copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const shareOnWhatsApp = (code: string, productName: string, price: number, slug: string) => {
    const fullUrl = `${baseUrl}/affiliate/simulator/shop/${slug}?ref=${code}`;
    const text = `🔥 Check out the ${productName} (NLe ${price.toLocaleString()}) on ProTech Training Store!\n\n👉 View details & test checkout: ${fullUrl}\n\n(ProTech Online Academy Practical Demonstration Link)`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleMarkNotification = async (id: string) => {
    await markDemoNotificationRead(id);
    if (statsData) {
      setStatsData({
        ...statsData,
        recentNotifications: statsData.recentNotifications.map((n: any) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <div className="h-28 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = statsData?.metrics || {
    linksCount: 0,
    totalClicks: 0,
    uniqueVisitors: 0,
    checkoutAttempts: 0,
    successfulPurchasesCount: 0,
    totalSalesValue: 0,
    approvedCommissionTotal: 0,
    pendingCommissionTotal: 0,
    conversionRate: "0.0",
  };

  const funnel = statsData?.funnel || [];
  const notifications = statsData?.recentNotifications || [];
  const unreadNotificationsCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Notice */}
      <SimulatorNoticeBanner />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-black text-[10px] uppercase tracking-wider border border-amber-500/30">
              Student Practical Environment
            </span>
            {statsData?.affiliate?.affiliateCode && (
              <span className="text-xs font-mono font-bold text-slate-500">
                Code: <span className="text-slate-900 dark:text-white font-black">{statsData.affiliate.affiliateCode}</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Affiliate Marketing Practical Simulator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time training dashboard: Generate links, simulate customer clicks, record mobile checkout, and audit demo commissions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
          <Link
            href="/affiliate/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            Main Portal
          </Link>
        </div>
      </div>

      {/* High-level KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clicks */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Tracked Clicks</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <MousePointerClick className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {metrics.totalClicks.toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-slate-400">
            {metrics.uniqueVisitors} unique visitors
          </div>
        </div>

        {/* Demo Orders */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Demo Purchases</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {metrics.successfulPurchasesCount.toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
            {metrics.conversionRate}% conversion rate
          </div>
        </div>

        {/* Simulated Sales Value */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Simulated GMV</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            NLe {metrics.totalSalesValue.toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            Training sales volume
          </div>
        </div>

        {/* Demo Commissions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Demo Commissions</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            NLe {metrics.approvedCommissionTotal.toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-slate-400">
            Status: Approved (Simulated)
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "marketplace"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Package className="h-4 w-4" />
          Product Marketplace ({products.length})
        </button>

        <button
          onClick={() => setActiveTab("funnel")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "funnel"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Interactive Funnel & Metrics
        </button>

        <button
          onClick={async () => {
            setActiveTab("links");
            // Always refresh links when switching to this tab so newly
            // generated links appear without needing a full page reload
            const [linksRes, statsRes] = await Promise.all([
              getMyTrainingLinks(),
              getStudentSimulatorStats(),
            ]);
            if (linksRes.success) setMyLinks(linksRes.links || []);
            if (statsRes.success) setStatsData(statsRes);
          }}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "links"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Share2 className="h-4 w-4" />
          My Demo Links ({myLinks.length})
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "orders"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Demo Orders & Ledger ({statsData?.recentOrders?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer relative ${
            activeTab === "notifications"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Bell className="h-4 w-4" />
          Notifications
          {unreadNotificationsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PRODUCT MARKETPLACE */}
      {activeTab === "marketplace" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Demonstration Products Catalog
              </h3>
              <p className="text-xs text-slate-500">
                Choose a product to generate your unique referral link, share it on WhatsApp, and practice the customer acquisition flow.
              </p>
            </div>
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 self-start sm:self-auto">
              {products.length} Training Products Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => {
              const existingLink = myLinks.find((l) => l.productId === p.id);
              const isGenerating = generatingProductId === p.id;

              return (
                <div
                  key={p.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-black text-[9px] uppercase tracking-wider">
                      {p.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Pricing & Commission Grid */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Demo Price:</span>
                        <span className="font-black text-slate-900 dark:text-white">
                          NLe {p.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Commission ({p.commissionPct}%):</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          NLe {p.estimatedCommission.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {existingLink ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyLinkUrl(existingLink.code, p.slug)}
                              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90 transition-all"
                            >
                              {copiedCode === existingLink.code ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy Link
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => shareOnWhatsApp(existingLink.code, p.name, p.price, p.slug)}
                              className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                              title="Share to WhatsApp"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                          </div>
                          <Link
                            href={`/affiliate/simulator/shop/${p.slug}?ref=${existingLink.code}`}
                            target="_blank"
                            className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold text-center block hover:bg-slate-50 transition-colors"
                          >
                            Open Test Storefront ↗
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateLink(p.id)}
                          disabled={isGenerating}
                          className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Zap className="h-3.5 w-3.5" />
                              Generate Demo Link
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE FUNNEL VISUALIZATION */}
      {activeTab === "funnel" && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Academy Performance Telemetry
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Affiliate Conversion Funnel
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Observe how potential customer traffic flows through your promotional link from initial click to checkout attempt, purchase confirmation, and demo commission credit.
              </p>
            </div>

            {/* Visual Funnel Step Flow */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {funnel.map((f: any, idx: number) => {
                const colors = [
                  "border-blue-500/30 bg-blue-500/5 text-blue-600",
                  "border-cyan-500/30 bg-cyan-500/5 text-cyan-600",
                  "border-indigo-500/30 bg-indigo-500/5 text-indigo-600",
                  "border-amber-500/30 bg-amber-500/5 text-amber-600",
                  "border-purple-500/30 bg-purple-500/5 text-purple-600",
                  "border-emerald-500/30 bg-emerald-500/5 text-emerald-600",
                ];
                const color = colors[idx % colors.length];

                return (
                  <div
                    key={f.step}
                    className={`p-4 rounded-2xl border-2 ${color} flex flex-col justify-between space-y-3 relative overflow-hidden`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider opacity-80">
                      <span>Step 0{idx + 1}</span>
                      {idx < funnel.length - 1 && <span className="hidden md:inline">→</span>}
                    </div>

                    <div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {f.count.toLocaleString()}
                      </div>
                      <h5 className="font-black text-xs tracking-tight text-slate-800 dark:text-slate-200 mt-1">
                        {f.step}
                      </h5>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {f.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Practical Session Advice Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                <Info className="h-4 w-4 text-amber-500" />
                Practical Session Exercise Checklist
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Generate your link for the <strong>Laptop (NLe 8,500)</strong> or <strong>Smartphone (NLe 3,500)</strong>.</li>
                <li>Share the link with your classmate or open in an incognito window to simulate customer visits.</li>
                <li>Verify your <strong>Tracked Clicks</strong> count increases immediately.</li>
                <li>Complete the customer form and enter an illustrative <strong>Orange Money</strong> reference.</li>
                <li>Verify your <strong>Demo Purchase</strong> and <strong>Demo Commission</strong> credit in this dashboard.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY DEMO LINKS */}
      {activeTab === "links" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Generated Demonstration Links
            </h3>
            <span className="text-xs text-slate-500">
              Each unique code automatically attributes orders and commissions to you.
            </span>
          </div>

          {myLinks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Share2 className="h-12 w-12 text-slate-300 mx-auto" />
              <h4 className="font-black text-base">No Links Generated Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Visit the Product Marketplace tab to generate your first training link.
              </p>
              <button
                onClick={() => setActiveTab("marketplace")}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs cursor-pointer"
              >
                Go to Marketplace
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Link Code</th>
                      <th className="py-3.5 px-4">Clicks</th>
                      <th className="py-3.5 px-4">Demo Orders</th>
                      <th className="py-3.5 px-4">Comm. Rate</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {myLinks.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {l.productName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            NLe {l.productPrice.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {l.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-blue-600 dark:text-blue-400">
                            {l.clicksCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-purple-600 dark:text-purple-400">
                            {l.ordersCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">
                          {l.commissionPct}% (NLe {l.calculatedCommission})
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyLinkUrl(l.code, l.productSlug)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] hover:bg-slate-200 cursor-pointer"
                            >
                              {copiedCode === l.code ? "Copied!" : "Copy"}
                            </button>
                            <Link
                              href={`/affiliate/simulator/shop/${l.productSlug}?ref=${l.code}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                              title="Test link"
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
          )}
        </div>
      )}

      {/* TAB 4: DEMO ORDERS & COMMISSION LEDGER */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Demonstration Orders & Commission Ledger
            </h3>
            <span className="text-xs text-slate-500">
              Audited practice purchases attributed to your links.
            </span>
          </div>

          {(!statsData?.recentOrders || statsData.recentOrders.length === 0) ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
              <h4 className="font-black text-base">No Orders Recorded Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Share your demonstration link and complete a simulated checkout to record an order.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Order Ref</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Sale Total</th>
                      <th className="py-3.5 px-4">Demo Commission</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {statsData.recentOrders.map((o: any) => (
                      <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {o.orderRef}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {o.customerName}
                          </span>
                          <span className="text-[10px] text-slate-400">{o.customerPhone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {o.productName} (Qty: {o.quantity})
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                          NLe {o.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">
                          NLe {o.commissionAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase tracking-wider">
                            {o.status} (Demo)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Student Activity Notifications
            </h3>
            <span className="text-xs text-slate-500">
              Automated alerts dispatched when customers click or complete practice orders.
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <Bell className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No notifications yet. Make a demo sale to receive an alert!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n: any) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkNotification(n.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    n.isRead
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70"
                      : "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
