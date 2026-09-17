"use client";

import React, { useState } from "react";
import { 
  Search, Eye, EyeOff, Star, Tag, DollarSign, Check, X, Filter, 
  ShoppingBag, ArrowUpDown, RefreshCw, ExternalLink, Sparkles, Wand2,
  Copy, CheckCheck, FileText, ChevronRight
} from "lucide-react";
import { updateStoreProductLink, generateProductAICopyAction } from "@/lib/actions/store-builder";
import { AIProductCopyOutput } from "@/types/store-builder";
import { toast } from "sonner";
import Link from "next/link";

interface ProductItem {
  id: string;
  name: string;
  sku?: string | null;
  unitPrice: number;
  stockQuantity: number;
  imageUrl?: string | null;
  category: string;
  status: string;
  isListedOnline: boolean;
  isFeatured: boolean;
  customBadge?: string | null;
  customPrice?: number | null;
  displayOrder: number;
}

interface Props {
  initialProducts: ProductItem[];
  currency?: string;
  storeSlug?: string;
}

export function StoreProductsManager({ initialProducts = [], currency = "SLE", storeSlug }: Props) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [filterMode, setFilterMode] = useState<"ALL" | "ONLINE" | "FEATURED" | "HIDDEN">("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Edit badge / custom price modal
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [badgeInput, setBadgeInput] = useState("");
  const [customPriceInput, setCustomPriceInput] = useState("");

  // AI Copywriter Modal State
  const [aiProduct, setAiProduct] = useState<ProductItem | null>(null);
  const [aiNotes, setAiNotes] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AIProductCopyOutput | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const categories = ["ALL", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    
    let matchesMode = true;
    if (filterMode === "ONLINE") matchesMode = p.isListedOnline;
    if (filterMode === "FEATURED") matchesMode = p.isListedOnline && p.isFeatured;
    if (filterMode === "HIDDEN") matchesMode = !p.isListedOnline;

    return matchesSearch && matchesCategory && matchesMode;
  });

  const handleToggleOnline = async (product: ProductItem) => {
    setLoadingId(product.id);
    const newStatus = !product.isListedOnline;
    try {
      await updateStoreProductLink(product.id, {
        isVisible: newStatus,
        isFeatured: newStatus ? product.isFeatured : false,
        customBadge: product.customBadge,
        customPrice: product.customPrice
      });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isListedOnline: newStatus, isFeatured: newStatus ? p.isFeatured : false } : p));
      toast.success(newStatus ? `"${product.name}" is now visible online` : `"${product.name}" hidden from online store`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update visibility");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleFeatured = async (product: ProductItem) => {
    if (!product.isListedOnline) {
      toast.info("Please enable online visibility first to feature this item.");
      return;
    }
    setLoadingId(product.id);
    const newFeatured = !product.isFeatured;
    try {
      await updateStoreProductLink(product.id, {
        isVisible: true,
        isFeatured: newFeatured,
        customBadge: product.customBadge,
        customPrice: product.customPrice
      });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: newFeatured } : p));
      toast.success(newFeatured ? `"${product.name}" spotlighted as Featured!` : `"${product.name}" removed from Featured`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update featured state");
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setBadgeInput(p.customBadge || "");
    setCustomPriceInput(p.customPrice ? String(p.customPrice) : "");
  };

  const handleSaveCustomDetails = async () => {
    if (!editingProduct) return;
    setLoadingId(editingProduct.id);
    try {
      const parsedPrice = customPriceInput.trim() ? parseFloat(customPriceInput.trim()) : null;
      const cleanBadge = badgeInput.trim() ? badgeInput.trim().toUpperCase() : null;

      await updateStoreProductLink(editingProduct.id, {
        isVisible: editingProduct.isListedOnline,
        isFeatured: editingProduct.isFeatured,
        customBadge: cleanBadge,
        customPrice: parsedPrice
      });

      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        customBadge: cleanBadge,
        customPrice: parsedPrice
      } : p));

      toast.success("Product online overrides saved!");
      setEditingProduct(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save product details");
    } finally {
      setLoadingId(null);
    }
  };

  // AI Copywriter Open & Execution
  const handleOpenAiCopy = (product: ProductItem) => {
    setAiProduct(product);
    setAiNotes("");
    setAiResult(null);
  };

  const handleRunAiCopy = async () => {
    if (!aiProduct) return;
    setIsGeneratingAi(true);
    try {
      const res = await generateProductAICopyAction({
        name: aiProduct.name,
        category: aiProduct.category,
        price: aiProduct.unitPrice,
        notes: aiNotes
      });
      if (res.success && res.copy) {
        setAiResult(res.copy);
        toast.success("AI Product copy generated!");
      } else {
        toast.error("Failed to generate AI copy. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "AI copy generation error");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApplyAiBadge = async (badge: string) => {
    if (!aiProduct) return;
    try {
      await updateStoreProductLink(aiProduct.id, {
        isVisible: true,
        isFeatured: aiProduct.isFeatured,
        customBadge: badge.toUpperCase(),
        customPrice: aiProduct.customPrice
      });
      setProducts(prev => prev.map(p => p.id === aiProduct.id ? { ...p, isListedOnline: true, customBadge: badge.toUpperCase() } : p));
      toast.success(`Badge "${badge}" applied to ${aiProduct.name}!`);
    } catch (err: any) {
      toast.error("Failed to apply badge");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Curate Online Catalog
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose which products from your inventory appear in your storefront, feature top sellers, or use AI Copywriter to generate high-converting product descriptions and SEO tags.
          </p>
        </div>
        {storeSlug && (
          <Link
            href={`/store/${storeSlug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors w-fit"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Live Store Catalog
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Category & Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-card border rounded-xl text-xs font-medium px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c === "ALL" ? "All Categories" : c}
              </option>
            ))}
          </select>

          <div className="flex items-center bg-muted/60 p-1 rounded-xl border text-xs font-medium">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterMode === "ALL" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilterMode("ONLINE")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterMode === "ONLINE" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              Online ({products.filter(p => p.isListedOnline).length})
            </button>
            <button
              onClick={() => setFilterMode("FEATURED")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterMode === "FEATURED" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              Featured ({products.filter(p => p.isListedOnline && p.isFeatured).length})
            </button>
            <button
              onClick={() => setFilterMode("HIDDEN")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterMode === "HIDDEN" ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              Hidden ({products.filter(p => !p.isListedOnline).length})
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Catalog Price</th>
                <th className="py-3.5 px-4 text-right">Store Price</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-center">Badge</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-center">Online Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <p className="text-base font-medium">No products match your criteria.</p>
                    <p className="text-xs mt-1">Try resetting your search query or filter filters.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className={`hover:bg-muted/20 transition-colors ${!p.isListedOnline ? "opacity-60 bg-muted/5" : ""}`}>
                    {/* Product visual + info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0 border">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground bg-muted">
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground line-clamp-1">{p.name}</p>
                          {p.sku && <p className="text-xs text-muted-foreground font-mono">SKU: {p.sku}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 rounded-md bg-muted border font-medium">
                        {p.category}
                      </span>
                    </td>

                    {/* Catalog Price */}
                    <td className="py-3.5 px-4 text-right font-medium">
                      {currency} {p.unitPrice.toLocaleString()}
                    </td>

                    {/* Custom Store Price */}
                    <td className="py-3.5 px-4 text-right">
                      {p.customPrice ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {currency} {p.customPrice.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Same as catalog</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.stockQuantity <= 0 
                          ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                          : p.stockQuantity < 5 
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {p.stockQuantity} in stock
                      </span>
                    </td>

                    {/* Custom Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {p.customBadge ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          {p.customBadge}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        disabled={loadingId === p.id}
                        title={p.isFeatured ? "Click to unfeature" : "Click to feature on homepage"}
                        className={`p-1.5 rounded-lg border transition-all ${
                          p.isFeatured 
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-500 hover:bg-amber-500/25" 
                            : "bg-background border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${p.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
                      </button>
                    </td>

                    {/* Online Toggle Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleOnline(p)}
                        disabled={loadingId === p.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          p.isListedOnline 
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25" 
                            : "bg-muted border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p.isListedOnline ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Hidden
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: AI Copy + Customize */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAiCopy(p)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-1 transition-colors"
                          title="Generate AI Copy & SEO"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          <span>AI Copy</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border hover:bg-muted transition-colors"
                        >
                          Customize
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CUSTOMIZE OVERRIDES MODAL ───────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base text-foreground">Online Product Settings</h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">{editingProduct.name}</p>
              <p className="text-xs text-muted-foreground">Standard Inventory Price: {currency} {editingProduct.unitPrice.toLocaleString()}</p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Custom Online Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`Leave empty for standard (${editingProduct.unitPrice})`}
                    value={customPriceInput}
                    onChange={(e) => setCustomPriceInput(e.target.value)}
                    className="w-full pl-12 pr-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Allows you to offer an online-exclusive discount or web promo price without altering your in-store POS pricing.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Promotional Badge (e.g. SALE, HOT, 20% OFF, TRENDING)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SALE or NEW"
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex items-center gap-1.5 mt-2">
                  {["SALE", "HOT", "NEW", "TRENDING", "BESTSELLER"].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBadgeInput(preset)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold border bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomDetails}
                disabled={loadingId === editingProduct.id}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {loadingId === editingProduct.id ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI PRODUCT COPYWRITER MODAL ─────────────────────── */}
      {aiProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    AI Product Copywriter
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      Atlas Grade
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Generate high-converting titles, descriptions, benefit bullets, and SEO meta tags.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiProduct(null)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product context box */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-xs font-bold text-foreground block truncate">{aiProduct.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  Category: {aiProduct.category} • Price: {currency} {aiProduct.unitPrice.toLocaleString()}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-background text-[11px] font-semibold border shrink-0">
                {aiProduct.stockQuantity} in stock
              </span>
            </div>

            {/* Prompt Notes Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Additional Product Highlights or Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Genuine Italian leather, waterproof, 1-year warranty, trending gift item..."
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Generate Action Button */}
            {!aiResult && (
              <div className="py-4 text-center">
                <button
                  type="button"
                  onClick={handleRunAiCopy}
                  disabled={isGeneratingAi}
                  className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white shadow-xl flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Product Copy...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate AI Copy & SEO</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* AI Results Section */}
            {aiResult && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                {/* Optimized Title */}
                <div className="p-3 rounded-xl bg-background border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                      AI Optimized Title
                    </span>
                    <button
                      onClick={() => copyToClipboard(aiResult.title, "title")}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === "title" ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === "title" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="font-bold text-foreground text-sm">{aiResult.title}</p>
                </div>

                {/* Short Description */}
                <div className="p-3 rounded-xl bg-background border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                      Short Hook Description
                    </span>
                    <button
                      onClick={() => copyToClipboard(aiResult.shortDescription, "short")}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === "short" ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === "short" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{aiResult.shortDescription}</p>
                </div>

                {/* Full Description */}
                <div className="p-3 rounded-xl bg-background border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                      Full Story Description
                    </span>
                    <button
                      onClick={() => copyToClipboard(aiResult.fullDescription, "full")}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === "full" ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === "full" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{aiResult.fullDescription}</p>
                </div>

                {/* Benefits & Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-background border space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block">
                      Key Benefits
                    </span>
                    <ul className="space-y-1">
                      {aiResult.benefits?.map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-muted-foreground">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-background border space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider block">
                      Core Features
                    </span>
                    <ul className="space-y-1">
                      {aiResult.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-muted-foreground">
                          <Check className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* SEO Meta Tags */}
                <div className="p-3 rounded-xl bg-background border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                      Search Engine Optimization (SEO)
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-semibold block">SEO Title:</span>
                    <p className="text-foreground font-medium">{aiResult.seoTitle}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-semibold block">Meta Description:</span>
                    <p className="text-muted-foreground">{aiResult.seoDescription}</p>
                  </div>
                  {aiResult.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {aiResult.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t">
              {aiResult ? (
                <button
                  type="button"
                  onClick={handleRunAiCopy}
                  disabled={isGeneratingAi}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAiProduct(null)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border hover:bg-muted"
                >
                  Done
                </button>
                {aiResult && (
                  <button
                    onClick={() => handleApplyAiBadge("FEATURED")}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90"
                  >
                    Set as Featured
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
