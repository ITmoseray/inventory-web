"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Store,
  Search,
  Filter,
  Phone,
  Send,
  Sparkles,
  ShieldCheck,
  Check,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Tag,
  DollarSign,
  RefreshCw,
  X,
  CreditCard,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getPublicPaanCampaigns } from "@/lib/actions/paan";

export default function MarketplacePage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [affiliateRefCode, setAffiliateRefCode] = useState<string | null>(null);

  // Order Modal
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("Freetown");
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);

  const categories = [
    "ALL",
    "Electronics",
    "Fashion",
    "Groceries",
    "Beauty",
    "Education",
    "Technology",
    "Restaurants",
    "Services",
  ];

  useEffect(() => {
    // Check if user arrived via affiliate referral link
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const refFromQuery = urlParams.get("ref");
      const cookieMatch = document.cookie.match(/pa_ref=([^;]+)/);
      const refFromCookie = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      const finalRef = refFromQuery || refFromCookie;
      if (finalRef) {
        setAffiliateRefCode(finalRef);
      }
    }

    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    setLoading(true);
    try {
      const res = await getPublicPaanCampaigns();
      if (res.success) {
        setCampaigns(res.campaigns || []);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load marketplace offers");
    } finally {
      setLoading(false);
    }
  }

  // Flatten all products across campaigns
  const allProducts: any[] = [];
  campaigns.forEach((camp) => {
    if (camp.products && camp.products.length > 0) {
      camp.products.forEach((p: any) => {
        allProducts.push({
          ...p,
          campaignId: camp.id,
          campaignTitle: camp.title,
          campaignCategory: camp.category,
          merchantName: camp.merchantName,
          merchantPhone: camp.merchantPhone,
          merchantAddress: camp.merchantAddress,
          affiliateEffectiveRate: camp.affiliateEffectiveRate,
          totalCommissionRate: camp.totalCommissionRate,
        });
      });
    } else {
      // Campaign as a whole offer (e.g. Service or Course)
      allProducts.push({
        id: camp.id,
        name: camp.title,
        price: camp.totalCommissionRate > 0 ? camp.totalCommissionRate * 10 : 100,
        imageUrl: camp.bannerUrl,
        description: camp.description,
        campaignId: camp.id,
        campaignTitle: camp.title,
        campaignCategory: camp.category,
        merchantName: camp.merchantName,
        merchantPhone: camp.merchantPhone,
        merchantAddress: camp.merchantAddress,
        affiliateEffectiveRate: camp.affiliateEffectiveRate,
        totalCommissionRate: camp.totalCommissionRate,
      });
    }
  });

  const filtered = allProducts.filter((p) => {
    const matchesCat = selectedCategory === "ALL" || p.campaignCategory === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleWhatsAppOrder = (product: any) => {
    const phone = product.merchantPhone || "+23276000000";
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const refTag = affiliateRefCode ? ` (PAAN Referral Code: ${affiliateRefCode})` : "";
    const text = `Hello ${product.merchantName}! I am interested in purchasing "${product.name}" priced at NLe ${product.price} via the PAAN Marketplace${refTag}. Is this available for delivery or pickup?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const openOrderModal = (product: any) => {
    setSelectedProduct(product);
    setOrderPlacedSuccess(false);
    setOrderModalOpen(true);
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      toast.error("Please fill in your name, phone number, and delivery address");
      return;
    }

    setSubmittingOrder(true);
    setTimeout(() => {
      setSubmittingOrder(false);
      setOrderPlacedSuccess(true);
      toast.success("Order placed successfully! The merchant will contact you shortly.");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Referral Tag Indicator */}
      {affiliateRefCode && (
        <div className="bg-emerald-600 text-white text-xs py-2 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          <span>
            Shopping with Verified Marketer Discount: <strong>{affiliateRefCode}</strong>
          </span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-6 md:px-12 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Store className="h-3.5 w-3.5" /> ProTech Assist Affiliate Network (PAAN)
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Sierra Leone National Multi-Merchant Marketplace
          </h1>

          <p className="text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed">
            Connecting Businesses. Empowering Marketers. Driving Sales across Freetown, Bo, Kenema, Makeni, and nationwide.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search electronics, groceries, fashion, services, or shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 text-sm font-medium shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 space-y-8">
        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Marketer Promo Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg border border-blue-700/50">
          <div className="space-y-1 max-w-2xl">
            <h3 className="text-xl font-black">Want to Earn by Promoting These Products?</h3>
            <p className="text-xs md:text-sm text-slate-200">
              Join the ProTech Assist Affiliate Network. Get trackable WhatsApp links, offline physical referral codes, and earn up to 70% of merchant commissions paid directly to Orange Money or Afrimoney.
            </p>
          </div>
          <Link
            href="/affiliate/register"
            className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-blue-950 hover:bg-slate-100 shadow-md shrink-0 transition"
          >
            Become a PAAN Marketer
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Loading verified marketplace items...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No items found matching your search.</p>
            <p className="text-xs text-slate-400 mt-1">Try switching categories or clearing search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image Header */}
                  <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingBag className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                    )}

                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white">
                      {item.campaignCategory}
                    </span>

                    {/* Affiliate Commission Badge */}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-md">
                      Earn {item.affiliateEffectiveRate?.toFixed(0) || 7}% Comm.
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Store className="h-3 w-3 text-blue-500" />
                      <span className="font-semibold truncate">{item.merchantName}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description || item.campaignTitle}
                    </p>

                    <div className="pt-2 flex items-baseline justify-between">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        NLe {Number(item.price).toLocaleString()}
                      </span>
                      {item.merchantAddress && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" /> {item.merchantAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleWhatsAppOrder(item)}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center gap-1.5 shadow-sm transition"
                      title="Order or Inquire directly on WhatsApp"
                    >
                      <Send className="h-3.5 w-3.5" /> WhatsApp
                    </button>

                    <button
                      onClick={() => openOrderModal(item)}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHECKOUT ORDER MODAL */}
      {orderModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Place Marketplace Order</h3>
              <button
                onClick={() => setOrderModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {orderPlacedSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">Order Received!</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Thank you, <strong>{customerName}</strong>! Your order for{" "}
                  <strong>{selectedProduct.name}</strong> has been transmitted to{" "}
                  <strong>{selectedProduct.merchantName}</strong>.
                </p>
                <p className="text-xs text-slate-400">
                  The merchant will contact you at <strong>{customerPhone}</strong> to confirm delivery arrangements.
                </p>
                <button
                  onClick={() => setOrderModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleCompleteOrder} className="space-y-4">
                {/* Product Summary */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedProduct.name}</p>
                    <p className="text-xs text-slate-500">Merchant: {selectedProduct.merchantName}</p>
                  </div>
                  <span className="text-lg font-black text-blue-600">NLe {selectedProduct.price}</span>
                </div>

                {affiliateRefCode && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-2 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Attributed to Marketer: {affiliateRefCode}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mariatu Kamara"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+232 ..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      City
                    </label>
                    <select
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      <option value="Freetown">Freetown</option>
                      <option value="Bo">Bo</option>
                      <option value="Kenema">Kenema</option>
                      <option value="Makeni">Makeni</option>
                      <option value="Koidu">Koidu</option>
                      <option value="Port Loko">Port Loko</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Delivery Address / Pickup Preference
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14 Siaka Stevens Street, Central Freetown"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="CASH_ON_DELIVERY">Cash on Delivery / In-Store Cash</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="AFRIMONEY">Afrimoney</option>
                    <option value="BANK_TRANSFER">Bank Transfer (SL Commercial / Rokel)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className="w-full py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center gap-2"
                  >
                    {submittingOrder ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
                    Confirm Order (NLe {selectedProduct.price})
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
