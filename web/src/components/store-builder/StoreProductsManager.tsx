"use client";

import React, { useState } from "react";
import { 
  Search, Eye, EyeOff, Star, Tag, DollarSign, Check, X, Filter, 
  ShoppingBag, ArrowUpDown, RefreshCw, ExternalLink
} from "lucide-react";
import { updateStoreProductLink } from "@/lib/actions/store-builder";
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

  // Edit badge / custom price modal or state
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [badgeInput, setBadgeInput] = useState("");
  const [customPriceInput, setCustomPriceInput] = useState("");

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
            Choose which products from your inventory appear in your storefront, feature top sellers, or set online-exclusive promo prices.
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

      {/* Products Table / List */}
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

                    {/* Edit Overrides Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border hover:bg-muted transition-colors"
                      >
                        Customize
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customize Modal */}
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
    </div>
  );
}
