"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Minus, Pencil, Trash2, MoreVertical, Package, Search, Filter, 
  Download, ArrowUpDown, ShoppingCart, Tag, Calculator, ChevronDown, 
  ChevronUp, Info, Boxes, Layers, LayoutGrid, List, Eye, BarChart3, 
  TrendingUp, AlertCircle, CheckCircle2, CheckCircle, Clock, XCircle, AlertTriangle,
  QrCode, ExternalLink, DollarSign, Activity, Star, ArrowUpRight, ShieldCheck, Box, RefreshCw,
  Percent, Check, ArrowRight, ShieldAlert, FileText, Image as ImageIcon,
  Laptop, Pill, ShoppingBag, Wine, Hammer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/ui/image-uploader";
import { uploadProductImage } from "@/lib/actions/upload";
import Image from "next/image";
import { toast } from "sonner";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/actions/product";
import { getCategories } from "@/lib/actions/category";
import { getFastMovingProducts } from "@/lib/actions/inventory";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "@/components/shared/empty-state";
import { BackButton } from "@/components/layout/ModuleHeader";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useRouter } from "next/navigation";
import { EnterprisePageHeader, EnterpriseKpiCard, EnterpriseBadge, StockStatusBadge } from "@/components/enterprise";

// ─── Packaging Unit Interface ─────────────────────────────────────────────────
interface PackagingUnit {
  id?: string;
  purchaseUnitName: string;
  purchaseCost: string;
  unitsPerPackage: string;
  sellingUnitName: string;
  sellingPrice: string;
  barcode?: string;
}

function calcCostPerUnit(purchaseCost: string, unitsPerPackage: string): number {
  const cost = parseFloat(purchaseCost);
  const units = parseFloat(unitsPerPackage);
  if (!cost || !units || units === 0) return 0;
  return cost / units;
}

function calcMargin(sellingPrice: string, costPerUnit: number): number {
  const sell = parseFloat(sellingPrice);
  if (!sell || !costPerUnit) return 0;
  return ((sell - costPerUnit) / sell) * 100;
}

const statusConfig = {
  in_stock: { label: "In Stock", bg: "#DCFCE7", color: "#15803D", icon: CheckCircle },
  low_stock: { label: "Low Stock", bg: "#FEF9C3", color: "#A16207", icon: AlertTriangle },
  out_of_stock: { label: "Out of Stock", bg: "#FEE2E2", color: "#B91C1C", icon: XCircle },
  expiring: { label: "Expiring", bg: "#FFEDD5", color: "#C2410C", icon: Clock },
  expired: { label: "Expired", bg: "#F3E8FF", color: "#7E22CE", icon: XCircle },
};

function getProductStatus(p: any): "in_stock" | "low_stock" | "out_of_stock" | "expiring" | "expired" {
  const stock = Number(p.stockQuantity) || 0;
  const min = Number(p.minStockLevel) || 10;
  
  if (p.metadata?.expiryDate) {
    const exp = new Date(p.metadata.expiryDate);
    const now = new Date();
    if (!isNaN(exp.getTime())) {
      if (exp < now) return "expired";
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (exp.getTime() - now.getTime() < thirtyDays) return "expiring";
    }
  }

  if (stock <= 0) return "out_of_stock";
  if (stock <= min) return "low_stock";
  return "in_stock";
}

// ─── Main Super Graphical Products Page ───────────────────────────────────────
export default function ProductsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [fastMovingProducts, setFastMovingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [inspectProduct, setInspectProduct] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");
  const [sourcingMode, setSourcingMode] = useState<"single" | "bulk" | null>(null);
  const [showPackagingOptions, setShowPackagingOptions] = useState(false);
  
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: "",
    name: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    unitPrice: "",
    costPrice: "",
    stockQuantity: "",
    minStockLevel: "10",
    maxStockLevel: "",
    isFavorite: false,
    categoryId: "",
    description: "",
    expiryDate: "",
    batchNumber: "",
    requiresPrescription: false,
    genericAlternative: "",
    isControlledSubstance: false,
    type: "PRODUCT" as "PRODUCT" | "SERVICE",
    isNetworkAvailable: false,
    imageUrl: "",
    baseUnit: "Piece",
    packagingUnits: [] as PackagingUnit[],
  });

  const businessType = session?.user?.businessType || "SHOP";
  const isPharmacy = businessType === "PHARMACY";
  const isBar = businessType === "BAR";
  const hasExpiryAndBatch = isPharmacy || businessType === "SUPERMARKET";

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [productsData, categoriesData, fastMovingData] = await Promise.all([
        getProducts(),
        getCategories(),
        getFastMovingProducts(),
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setFastMovingProducts(fastMovingData || []);
    } catch (error) {
      toast.error("Cloud synchronization failed.");
    } finally {
      setLoading(false);
    }
  }

  // Calculate High-level Graphical KPI Metrics
  const totalStockCount = products.reduce((acc, p) => acc + (Number(p.stockQuantity) || 0), 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + ((Number(p.stockQuantity) || 0) * (Number(p.unitPrice) || 0)), 0);
  const totalCostValuation = products.reduce((acc, p) => acc + ((Number(p.stockQuantity) || 0) * (Number(p.costPrice) || (Number(p.unitPrice) * 0.7))), 0);
  const lowStockCount = products.filter(p => (Number(p.stockQuantity) || 0) <= (Number(p.minStockLevel) || 10)).length;
  const avgMargin = totalRetailValuation > 0 
    ? Math.max(0, ((totalRetailValuation - totalCostValuation) / totalRetailValuation) * 100) 
    : 30;

  // Live Simple Profit calculations
  const formSellPrice = parseFloat(formData.unitPrice) || 0;
  const formCostPrice = parseFloat(formData.costPrice) || 0;
  const formUnitProfit = formSellPrice > 0 && formCostPrice > 0 ? formSellPrice - formCostPrice : 0;
  const formMargin = formSellPrice > 0 && formCostPrice > 0 ? ((formSellPrice - formCostPrice) / formSellPrice) * 100 : 0;

  // Smart SKU Generator
  const generateSmartSKU = () => {
    const prefix = formData.name
      ? formData.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase()
      : "PRD";
    const rand = Math.floor(100 + Math.random() * 900);
    const skuCode = `${prefix}-${rand}`;
    setFormData(prev => ({ ...prev, sku: skuCode }));
    toast.success(`Generated SKU: ${skuCode}`);
  };

  const filteredProducts = products
    .filter(p => {
      // 1. Search Query filter
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.category?.name && p.category.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      // 2. Category filter
      if (filterCategory !== "all" && p.categoryId !== filterCategory) {
        return false;
      }

      // 3. Stock & Status filter
      if (filterStock !== "all") {
        const s = getProductStatus(p);
        if (filterStock === "in_stock" && s !== "in_stock") return false;
        if (filterStock === "low_stock" && s !== "low_stock") return false;
        if (filterStock === "out_of_stock" && s !== "out_of_stock") return false;
        if (filterStock === "expiring" && s !== "expiring") return false;
        if (filterStock === "expired" && s !== "expired") return false;
        if (filterStock === "fav" && !p.isFavorite) return false;
        // Backward compatibility
        const stock = Number(p.stockQuantity) || 0;
        const minLevel = Number(p.minStockLevel) || 10;
        if (filterStock === "low" && (stock > minLevel || stock <= 0)) return false;
        if (filterStock === "out" && stock > 0) return false;
        if (filterStock === "in" && stock <= minLevel) return false;
      }

      // 4. Product Type filter
      if (filterType !== "all" && p.type !== filterType) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "price_asc":
          return (Number(a.unitPrice) || 0) - (Number(b.unitPrice) || 0);
        case "price_desc":
          return (Number(b.unitPrice) || 0) - (Number(a.unitPrice) || 0);
        case "stock_asc":
          return (Number(a.stockQuantity) || 0) - (Number(b.stockQuantity) || 0);
        case "stock_desc":
          return (Number(b.stockQuantity) || 0) - (Number(a.stockQuantity) || 0);
        default:
          return 0;
      }
    });

  // Convert packaging units to ProductUnit format for backend
  function packagingToUnits(packagingUnits: PackagingUnit[]) {
    return packagingUnits.map(pu => ({
      name: pu.sellingUnitName,
      ratio: parseFloat(pu.unitsPerPackage) || 1,
      sellingPrice: parseFloat(pu.sellingPrice) || 0,
      costPrice: calcCostPerUnit(pu.purchaseCost, pu.unitsPerPackage),
      barcode: pu.barcode || "",
    }));
  }

  // Convert stored units back to packaging format
  function unitsToPackaging(units: any[]): PackagingUnit[] {
    return units.map(u => {
      const ratio = Number(u.ratio) || 1;
      const costPrice = Number(u.costPrice) || 0;
      return {
        id: u.id,
        purchaseUnitName: "Carton",
        purchaseCost: Math.round(costPrice * ratio).toString(),
        unitsPerPackage: ratio.toString(),
        sellingUnitName: u.name || "Piece",
        sellingPrice: u.sellingPrice?.toString() || "",
        barcode: u.barcode || "",
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const units = packagingToUnits(formData.packagingUnits);

      const primarySellingPrice = units.length > 0
        ? units[0].sellingPrice
        : parseFloat(formData.unitPrice);

      const primaryCostPrice = units.length > 0
        ? units[0].costPrice
        : (formData.costPrice ? parseFloat(formData.costPrice) : 0);

      const data = {
        ...formData,
        unitPrice: primarySellingPrice || parseFloat(formData.unitPrice) || 0,
        costPrice: primaryCostPrice || (formData.costPrice ? parseFloat(formData.costPrice) : 0),
        stockQuantity: formData.type === "SERVICE" ? 0 : parseInt(formData.stockQuantity || "0"),
        minStockLevel: formData.type === "SERVICE" ? 0 : parseInt(formData.minStockLevel || "10"),
        maxStockLevel: formData.type === "SERVICE" || !formData.maxStockLevel ? null : parseInt(formData.maxStockLevel),
        isFavorite: formData.isFavorite,
        categoryId: formData.categoryId === "none" ? null : formData.categoryId,
        requiresPrescription: isPharmacy ? formData.requiresPrescription : false,
        genericAlternative: isPharmacy ? formData.genericAlternative : null,
        isControlledSubstance: isPharmacy ? formData.isControlledSubstance : false,
        metadata: {
          expiryDate: hasExpiryAndBatch ? formData.expiryDate : undefined,
          batchNumber: hasExpiryAndBatch ? formData.batchNumber : undefined,
          isAlcoholic: isBar ? true : undefined,
          packagingUnits: formData.packagingUnits,
        },
        units: units.map(u => ({
          name: u.name,
          ratio: u.ratio,
          sellingPrice: u.sellingPrice,
          costPrice: u.costPrice,
          barcode: u.barcode,
        }))
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast.success("Product updated successfully.");
      } else {
        await createProduct(data);
        toast.success("New product added to inventory.");
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Operation failed. Please check permissions.");
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      sku: "",
      unitPrice: "",
      costPrice: "",
      stockQuantity: "",
      minStockLevel: "10",
      maxStockLevel: "",
      isFavorite: false,
      categoryId: "",
      description: "",
      expiryDate: "",
      batchNumber: "",
      requiresPrescription: false,
      genericAlternative: "",
      isControlledSubstance: false,
      type: "PRODUCT",
      isNetworkAvailable: false,
      imageUrl: "",
      baseUnit: "Piece",
      packagingUnits: [],
    });
    setSourcingMode(null);
    setShowPackagingOptions(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteProduct(id);
      toast.success("Product removed from inventory.");
      if (inspectProduct?.id === id) {
        setInspectProduct(null);
      }
      fetchData();
    } catch (error) {
      toast.error("Unauthorized operation.");
    }
  }

  function handleEdit(product: any) {
    setEditingProduct(product);
    const metadata = (product.metadata as any) || {};
    const storedPackaging: PackagingUnit[] = metadata.packagingUnits
      ? metadata.packagingUnits
      : unitsToPackaging(product.units || []);

    setFormData({
      name: product.name,
      sku: product.sku || "",
      unitPrice: product.unitPrice.toString(),
      costPrice: product.costPrice?.toString() || "",
      stockQuantity: product.stockQuantity.toString(),
      minStockLevel: product.minStockLevel.toString(),
      maxStockLevel: product.maxStockLevel?.toString() || "",
      isFavorite: product.isFavorite || false,
      categoryId: product.categoryId || "none",
      description: product.description || "",
      expiryDate: metadata.expiryDate || "",
      batchNumber: metadata.batchNumber || "",
      requiresPrescription: product.requiresPrescription || false,
      genericAlternative: product.genericAlternative || "",
      isControlledSubstance: product.isControlledSubstance || false,
      type: product.type || "PRODUCT",
      isNetworkAvailable: product.isNetworkAvailable || false,
      imageUrl: product.imageUrl || "",
      baseUnit: product.baseUnit || "Piece",
      packagingUnits: storedPackaging,
    });
    setSourcingMode(storedPackaging.length > 0 ? "bulk" : "single");
    setShowPackagingOptions(storedPackaging.length > 0);
    setIsDialogOpen(true);
  }

  const addPackagingPreset = (buyUnit: string, ratio: string, sellUnit: string) => {
    setFormData(prev => ({
      ...prev,
      baseUnit: sellUnit,
      packagingUnits: [
        ...prev.packagingUnits,
        {
          purchaseUnitName: buyUnit,
          purchaseCost: prev.costPrice && ratio ? (parseFloat(prev.costPrice) * parseFloat(ratio)).toString() : "",
          unitsPerPackage: ratio,
          sellingUnitName: sellUnit,
          sellingPrice: prev.unitPrice || "",
          barcode: "",
        }
      ]
    }));
    toast.success(`Added ${buyUnit} ➔ ${sellUnit} ratio`);
  };

  const removePackagingUnit = (index: number) => {
    const newUnits = [...formData.packagingUnits];
    newUnits.splice(index, 1);
    setFormData({ ...formData, packagingUnits: newUnits });
  };

  const updatePackagingUnit = (index: number, field: keyof PackagingUnit, value: string) => {
    const newUnits = [...formData.packagingUnits];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setFormData({ ...formData, packagingUnits: newUnits });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-16">
      
      {/* 1. TOP HEADER & ACTIONS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            {isBar ? "Bar Stock" : isPharmacy ? "Pharmacy" : "Inventory"} Catalog
          </h1>
          <p className="section-label" style={{ margin: "4px 0 0 0" }}>
            Manage product catalog, real-time stock levels, profit margins, and packaging units.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* View Mode Switcher */}
          <div style={{ display: "flex", background: "var(--muted)", padding: 3, borderRadius: 8, border: "1px solid var(--border)" }}>
            <button
              onClick={() => setViewMode("table")}
              style={{
                padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                background: viewMode === "table" ? "#2563EB" : "transparent",
                color: viewMode === "table" ? "#fff" : "var(--muted-foreground)",
                display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600
              }}
              title="Table View"
            >
              <List size={13} /> Table
            </button>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                background: viewMode === "grid" ? "#2563EB" : "transparent",
                color: viewMode === "grid" ? "#fff" : "var(--muted-foreground)",
                display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600
              }}
              title="Cards View"
            >
              <LayoutGrid size={13} /> Cards
            </button>
          </div>

          <button
            className="btn-secondary"
            onClick={() => {
              let csv = "Name,SKU,Category,Stock,Cost,Price\n";
              filteredProducts.forEach(p => {
                csv += `"${p.name}","${p.sku || ""}","${p.category?.name || ""}","${p.stockQuantity}","${p.costPrice || 0}","${p.unitPrice}"\n`;
              });
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `products_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              toast.success("Catalog exported to CSV format.");
            }}
            style={{ padding: "7px 12px", fontSize: 12.5 }}
          >
            <Download size={13} /> Export
          </button>

          <button
            className="btn-primary"
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setIsDialogOpen(true);
            }}
            style={{ padding: "7px 16px", fontSize: 12.5 }}
          >
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* 2. 4 TOP KPI CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Products", value: products.length, sub: `${totalStockCount.toLocaleString()} total units`, color: "#2563EB" },
          { label: "In Stock", value: products.filter(p => getProductStatus(p) === "in_stock").length, sub: "Optimal stock levels", color: "#10B981" },
          { label: "Low Stock", value: products.filter(p => getProductStatus(p) === "low_stock").length, sub: "Requires replenishment", color: "#F59E0B" },
          { label: "Out of Stock", value: products.filter(p => getProductStatus(p) === "out_of_stock").length, sub: "0 units remaining", color: "#EF4444" },
        ].map(s => (
          <div key={s.label} className="kpi-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{s.sub}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Package size={18} color={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* 3. MAIN CARD (TOOLBAR + TABLE / CARDS) */}
      <div className="card" style={{ overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 7, alignItems: "center", background: "var(--muted)", borderRadius: 8, padding: "7px 12px", flex: 1, minWidth: 200, maxWidth: 320, border: "1px solid var(--border)" }}>
            <Search size={14} color="var(--muted-foreground)" />
            <input
              placeholder="Search products, SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "var(--foreground)", width: "100%" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 12 }}>✕</button>
            )}
          </div>

          <select
            value={filterStock}
            onChange={e => setFilterStock(e.target.value)}
            style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, color: "var(--foreground)", cursor: "pointer", outline: "none" }}
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
            <option value="fav">⭐ Favorites</option>
          </select>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, color: "var(--foreground)", cursor: "pointer", outline: "none" }}
          >
            <option value="all">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 12px", fontSize: 12.5, color: "var(--foreground)", cursor: "pointer", outline: "none" }}
          >
            <option value="name_asc">Name (A → Z)</option>
            <option value="name_desc">Name (Z → A)</option>
            <option value="price_desc">Price (High to Low)</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="stock_desc">Stock Volume (Highest)</option>
            <option value="stock_asc">Stock Volume (Lowest)</option>
          </select>
        </div>

        {/* 4. MAIN CONTENT: TABLE OR CARDS VIEW */}
        {loading ? (
          <div style={{ padding: "48px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 180, borderRadius: 12, background: "var(--muted)", opacity: 0.6 }} className="animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center", color: "var(--muted-foreground)" }}>
            <Package size={44} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>No products match filters</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search term or selecting another category.</div>
            <button
              className="btn-secondary"
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("all");
                setFilterStock("all");
              }}
              style={{ marginTop: 16, padding: "7px 16px", fontSize: 12.5 }}
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* ─── 4A: CARDS VIEW (FIGMA MAKE STYLED) ─── */
          <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filteredProducts.map((product) => {
              const stock = Number(product.stockQuantity) || 0;
              const minStock = Number(product.minStockLevel) || 10;
              const sellPrice = parseFloat(product.unitPrice) || 0;
              const costPrice = parseFloat(product.costPrice) || 0;
              const margin = sellPrice > 0 && costPrice > 0 ? ((sellPrice - costPrice) / sellPrice) * 100 : 0;
              const skuTag = product.sku || `SKU-${product.id.slice(-4).toUpperCase()}`;
              const sKey = getProductStatus(product);
              const s = statusConfig[sKey];
              const Icon = s.icon;

              return (
                <div
                  key={product.id}
                  className="card table-row-hover"
                  style={{ borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid var(--border)" }}
                >
                  {/* Card Thumbnail / Header */}
                  <div style={{ position: "relative", height: 140, background: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: "cover" }} unoptimized />
                    ) : (
                      <Package size={48} color="var(--muted-foreground)" style={{ opacity: 0.4 }} />
                    )}
                    <div style={{ position: "absolute", top: 10, left: 10 }}>
                      <span className="status-badge" style={{ background: s.bg, color: s.color, display: "inline-flex", gap: 4, backdropFilter: "blur(4px)" }}>
                        <Icon size={11} /> {s.label}
                      </span>
                    </div>
                    {product.isFavorite && (
                      <div style={{ position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: "50%", background: "#F59E0B", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                        ★
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", fontWeight: 600 }}>
                          {product.category?.name || "General"}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>
                          {skuTag}
                        </span>
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--foreground)" }} className="line-clamp-1">
                        {product.name}
                      </div>
                    </div>

                    <div style={{ paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Price</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>
                          Le {Math.round(sellPrice).toLocaleString()}
                        </div>
                        {costPrice > 0 && (
                          <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
                            Cost: Le {Math.round(costPrice).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10.5, color: "var(--muted-foreground)", textTransform: "uppercase" }}>In Stock</div>
                        <div style={{
                          fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700,
                          color: stock <= minStock ? "#EF4444" : "var(--foreground)"
                        }}>
                          {stock}
                        </div>
                        {margin > 0 && (
                          <span style={{ fontSize: 10, color: "#10B981", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                            +{margin.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 6 }}>
                      <button
                        onClick={() => setInspectProduct(product)}
                        className="btn-secondary"
                        style={{ padding: "6px 10px", fontSize: 11.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                      >
                        <Eye size={12} /> View
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{
                          background: "#EFF6FF", border: "none", borderRadius: 8, padding: "6px 10px",
                          fontSize: 11.5, color: "#2563EB", fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                        }}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── 4B: TABLE VIEW (FIGMA MAKE STYLED) ─── */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  {["Product", "SKU", "Category", "Warehouse", "Qty", "Cost", "Price", "Stock Value", "Status", "Actions"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)",
                      padding: "10px 14px", textTransform: "uppercase", letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const stock = Number(product.stockQuantity) || 0;
                  const minStock = Number(product.minStockLevel) || 10;
                  const sellPrice = parseFloat(product.unitPrice) || 0;
                  const costPrice = parseFloat(product.costPrice) || 0;
                  const stockValue = stock * (costPrice > 0 ? costPrice : sellPrice);
                  const skuTag = product.sku || `SKU-${product.id.slice(-4).toUpperCase()}`;
                  const sKey = getProductStatus(product);
                  const s = statusConfig[sKey];
                  const Icon = s.icon;
                  const expiry = product.metadata?.expiryDate;

                  return (
                    <tr
                      key={product.id}
                      className="table-row-hover"
                      style={{ borderTop: "1px solid var(--border)", cursor: "pointer" }}
                      onClick={() => setInspectProduct(product)}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                            {product.imageUrl ? (
                              <Image src={product.imageUrl} alt={product.name} width={36} height={36} style={{ objectFit: "cover" }} unoptimized />
                            ) : (
                              <Package size={18} color="var(--muted-foreground)" />
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--foreground)" }} className="truncate">{product.name}</div>
                            {expiry && <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Exp: {expiry}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                        {skuTag}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 12.5, color: "var(--foreground)" }}>
                        {product.category?.name || "General"}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 12.5, color: "var(--muted-foreground)" }}>
                        Main Store
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{
                          fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
                          color: stock <= minStock ? "#EF4444" : "var(--foreground)",
                        }}>{stock}</span>
                        <div style={{ fontSize: 10.5, color: "var(--muted-foreground)" }}>Min: {minStock}</div>
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted-foreground)" }}>
                        Le {Math.round(costPrice).toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
                        Le {Math.round(sellPrice).toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#10B981" }}>
                        Le {Math.round(stockValue).toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span className="status-badge" style={{ background: s.bg, color: s.color, display: "inline-flex", gap: 4 }}>
                          <Icon size={11} /> {s.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleEdit(product)}
                            style={{ background: "#EFF6FF", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11.5, color: "#2563EB", fontWeight: 600, cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setInspectProduct(product)}
                            style={{ background: "var(--muted)", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11.5, color: "var(--muted-foreground)", fontWeight: 600, cursor: "pointer" }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, id: product.id, name: product.name })}
                            style={{ background: "#FEE2E2", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 11.5, color: "#B91C1C", fontWeight: 600, cursor: "pointer" }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>
            Showing {filteredProducts.length} of {products.length} products
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={{
              width: 30, height: 30, border: "1px solid #2563EB",
              borderRadius: 6, background: "#2563EB", color: "#fff",
              fontSize: 12.5, cursor: "pointer", fontWeight: 700
            }}>1</button>
          </div>
        </div>
      </div>

      {/* 5. SUPER GRAPHICAL PRODUCT INTELLIGENCE INSPECTION MODAL */}
      <AnimatePresence>
        {inspectProduct && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl max-w-xl w-full p-0 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
                <button
                  onClick={() => setInspectProduct(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 text-slate-300"
                >
                  <span className="text-lg font-bold">✕</span>
                </button>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-indigo-400 block mb-1">
                  Product Details
                </span>
                <h3 className="text-2xl font-black">{inspectProduct.name}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  SKU: {inspectProduct.sku || `SKU-${inspectProduct.id.slice(-4).toUpperCase()}`} • {inspectProduct.category?.name || "General Catalog"}
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                
                {/* Photo & Stock Gauge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="relative aspect-square w-full rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                    {inspectProduct.imageUrl ? (
                      <Image src={inspectProduct.imageUrl} alt={inspectProduct.name} fill className="object-cover" unoptimized />
                    ) : (
                      <Package className="h-12 w-12 text-slate-400" />
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">In-Stock Count</span>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                          {inspectProduct.stockQuantity} <span className="text-xs font-normal text-slate-400">Units</span>
                        </span>
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase",
                          inspectProduct.stockQuantity <= inspectProduct.minStockLevel
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        )}>
                          {inspectProduct.stockQuantity <= inspectProduct.minStockLevel ? "Low Stock" : "In Stock"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Low Alert Level: {inspectProduct.minStockLevel || 10} units
                      </div>
                    </div>

                    {/* Price Overview */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                        <span className="text-[9px] font-mono text-indigo-500 uppercase font-bold block">Sell Cost to Customer</span>
                        <span className="text-base font-black font-mono text-indigo-950 dark:text-indigo-200">
                          Le {Math.round(parseFloat(inspectProduct.unitPrice)).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Purchase Cost from Supplier</span>
                        <span className="text-base font-black font-mono text-slate-700 dark:text-slate-300">
                          Le {Math.round(parseFloat(inspectProduct.costPrice || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Packaging Hierarchy */}
                {inspectProduct.units && inspectProduct.units.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Bulk Packaging Ratios
                    </span>
                    <div className="space-y-1.5">
                      {inspectProduct.units.map((u: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Boxes className="h-3.5 w-3.5 text-indigo-500" /> {u.name} (1:{u.ratio})
                          </span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            Le {Math.round(u.sellingPrice).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer Controls */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap gap-2.5">
                <Button
                  onClick={() => {
                    const prod = inspectProduct;
                    setInspectProduct(null);
                    handleEdit(prod);
                  }}
                  variant="outline"
                  className="flex-1 h-11 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Product
                </Button>
                <Button
                  onClick={() => {
                    const prodName = inspectProduct.name;
                    setInspectProduct(null);
                    router.push(`/dashboard/pos?search=${encodeURIComponent(prodName)}`);
                  }}
                  className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Open in POS
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. SUPER SIMPLE, CLEAN & INTUITIVE ADD / EDIT PRODUCT MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingProduct(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[700px] w-[95vw] sm:w-full rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
          
          {/* Friendly Clean Header */}
          <div className="bg-slate-900 dark:bg-slate-950 p-6 sm:p-7 text-white shrink-0 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mt-0.5">
                  Enter product details, price, and stock below
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors text-sm font-bold"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950">
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-6">

              {/* 0. Upfront Choice: How do you buy this product? */}
              <div className="p-5 sm:p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-4">
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center justify-center sm:justify-start gap-1.5">
                    <Boxes className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    How do you purchase this product from your supplier?
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Please select an option below to configure pricing and packaging.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Option 1: Single Item */}
                  <button
                    type="button"
                    onClick={() => {
                      setSourcingMode("single");
                      setFormData(prev => ({ ...prev, packagingUnits: [] }));
                    }}
                    className={cn(
                      "p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-3 cursor-pointer group hover:scale-[1.01]",
                      sourcingMode === "single"
                        ? "bg-white dark:bg-slate-900 border-indigo-600 shadow-lg ring-2 ring-indigo-500/30"
                        : "bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-500"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-2xl flex items-center justify-center font-bold transition-colors",
                          sourcingMode === "single" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-indigo-50 dark:bg-slate-800 text-indigo-600"
                        )}>
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white block">
                            Single Item
                          </span>
                          <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                            Individual Units
                          </span>
                        </div>
                      </div>
                      <div className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                        sourcingMode === "single" ? "border-indigo-600 bg-indigo-600 text-white shadow-sm" : "border-slate-300 dark:border-slate-700"
                      )}>
                        {sourcingMode === "single" && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      I buy and sell each item individually (e.g. 1 Phone, 1 Camera, 1 Laptop, 1 Shirt, 1 Watch).
                    </p>
                  </button>

                  {/* Option 2: Bulk Packaging */}
                  <button
                    type="button"
                    onClick={() => {
                      setSourcingMode("bulk");
                      if (formData.packagingUnits.length === 0) {
                        addPackagingPreset("Carton", "10", "Piece");
                      }
                    }}
                    className={cn(
                      "p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-3 cursor-pointer group hover:scale-[1.01]",
                      sourcingMode === "bulk"
                        ? "bg-white dark:bg-slate-900 border-indigo-600 shadow-lg ring-2 ring-indigo-500/30"
                        : "bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-500"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-2xl flex items-center justify-center font-bold transition-colors",
                          sourcingMode === "bulk" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-indigo-50 dark:bg-slate-800 text-indigo-600"
                        )}>
                          <Boxes className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white block">
                            Bulk Packaging
                          </span>
                          <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                            Carton / Box / Crate
                          </span>
                        </div>
                      </div>
                      <div className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                        sourcingMode === "bulk" ? "border-indigo-600 bg-indigo-600 text-white shadow-sm" : "border-slate-300 dark:border-slate-700"
                      )}>
                        {sourcingMode === "bulk" && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      I buy in bulk containers (Carton, Box, Crate, Sack) and retail by Pieces, Bottles, or Kg.
                    </p>
                  </button>
                </div>
              </div>

              {/* Only show form sections once user selects an option */}
              {sourcingMode === null ? (
                <div className="p-8 sm:p-12 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 text-center space-y-3 bg-white/40 dark:bg-slate-900/30">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                    
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                      Please Select Sourcing Option Above
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                      Click <strong>Single Item</strong> or <strong>Bulk Packaging</strong> above to enter product specifications.
                    </p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >

              {/* Section 1: Basic Information & Photo */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Package className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    1. Product Information
                  </span>
                </div>

                {/* Photo Uploader */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Product Photo (Optional)
                  </Label>
                  <ImageUploader
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    uploadAction={uploadProductImage}
                  />
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Product Name *
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Hikvision 2MP IP Camera"
                    className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm"
                    required
                  />
                </div>

                {/* SKU Code & Category in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        SKU / Barcode
                      </Label>
                      <button
                        type="button"
                        onClick={generateSmartSKU}
                        className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                      >
                         Auto-Gen Code
                      </button>
                    </div>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g. HIK-2MP-001"
                      className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Category
                    </Label>
                    <Select
                      value={formData.categoryId || "none"}
                      onValueChange={(val: string) => setFormData({ ...formData, categoryId: val ?? "none" })}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <SelectItem value="none">Uncategorized</SelectItem>
                        {categories.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* ─── CASE A: SINGLE / INDIVIDUAL ITEM PRICING ─── */}
              {sourcingMode === "single" && (
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Tag className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      2. Price &amp; Profit (Single Item)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        Sell Cost to Customer (Le) *
                      </Label>
                      <Input
                        type="number"
                        step="1"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                        placeholder="0.00"
                        className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-black text-indigo-600 dark:text-indigo-400 text-lg"
                        required
                      />
                      <span className="text-[10px] text-slate-400">Price customers pay at POS / checkout</span>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        Purchase Cost from Supplier (Le)
                      </Label>
                      <Input
                        type="number"
                        step="1"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                        placeholder="0.00"
                        className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-rose-600 dark:text-rose-400 text-lg"
                      />
                      <span className="text-[10px] text-slate-400">What you paid supplier to buy item (Optional)</span>
                    </div>
                  </div>

                  {/* Intelligent Profit / Loss & Break-Even Telemetry Banner */}
                  {formSellPrice > 0 && formCostPrice > 0 && (
                    formUnitProfit > 0 ? (
                      /* 🟢 PROFIT SCENARIO */
                      <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                            Estimated Profit: +Le {Math.round(formUnitProfit).toLocaleString()} / item
                          </span>
                          <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                            +{formMargin.toFixed(0)}% Profit Margin
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-medium">
                          You make <strong>+Le {Math.round(formUnitProfit).toLocaleString()}</strong> profit per unit sold (Sell cost Le {Math.round(formSellPrice).toLocaleString()} minus Purchase cost Le {Math.round(formCostPrice).toLocaleString()}).
                        </p>
                      </div>
                    ) : formUnitProfit < 0 ? (
                      /* 🔴 LOSS WARNING SCENARIO */
                      <div className="p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-rose-700 dark:text-rose-300 font-extrabold flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4 text-rose-600 animate-pulse" />
                            Warning: Selling at a Loss (-Le {Math.abs(Math.round(formUnitProfit)).toLocaleString()} / item)
                          </span>
                          <span className="bg-rose-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                            {formMargin.toFixed(0)}% Loss
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-700/90 dark:text-rose-300/90 font-medium">
                          Your sell cost to customer (<strong>Le {Math.round(formSellPrice).toLocaleString()}</strong>) is lower than your purchase cost from supplier (<strong>Le {Math.round(formCostPrice).toLocaleString()}</strong>). You will lose Le {Math.abs(Math.round(formUnitProfit)).toLocaleString()} on every unit sold.
                        </p>
                      </div>
                    ) : (
                      /* ⚪ BREAK-EVEN SCENARIO */
                      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-slate-500" />
                          Break-Even: Le 0 Profit (0% Margin)
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Sell cost equals purchase cost</span>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ─── CASE B: BULK PACKAGING & CONVERSION ECONOMICS ─── */}
              {sourcingMode === "bulk" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-md space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                        <Boxes className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-900 dark:text-white block">
                          2. Bulk Packaging &amp; Pricing Conversion
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Set your bulk container cost and retail selling price per piece
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addPackagingPreset("Carton", "10", "Piece", "28000", "3500")}
                      className="rounded-xl text-xs font-bold font-mono text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    >
                      + Add Another Tier
                    </Button>
                  </div>

                  {/* 1-Click Simple Quick Add Presets */}
                  <div className="flex items-center gap-2 flex-wrap bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                    <span className="text-[10px] font-mono font-bold text-indigo-900 dark:text-indigo-300 uppercase mr-1">1-Click Presets:</span>
                    <button
                      type="button"
                      onClick={() => addPackagingPreset("Carton", "10", "Piece", "28000", "3500")}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                    >
                      + 1 Carton = 10 Pieces
                    </button>
                    <button
                      type="button"
                      onClick={() => addPackagingPreset("Box", "12", "Unit", "12000", "1500")}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                    >
                      + 1 Box = 12 Units
                    </button>
                    <button
                      type="button"
                      onClick={() => addPackagingPreset("Bundle", "5", "Set", "75000", "20000")}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                    >
                      + 1 Bundle = 5 Sets
                    </button>
                  </div>

                  {/* Bulk Packaging Ratio Cards */}
                  {formData.packagingUnits.length === 0 ? (
                    <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 text-center space-y-2">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No bulk ratio added yet</p>
                      <Button
                        type="button"
                        onClick={() => addPackagingPreset("Carton", "10", "Piece", "28000", "3500")}
                        className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                      >
                        + Add 1 Carton = 10 Pieces
                      </Button>
                    </div>
                  ) : (
                    formData.packagingUnits.map((unit, index) => {
                      const bulkCost = parseFloat(unit.purchaseCost) || 0;
                      const itemsInPkg = parseFloat(unit.unitsPerPackage) || 1;
                      const costPerPiece = itemsInPkg > 0 && bulkCost > 0 ? bulkCost / itemsInPkg : 0;
                      const pieceSell = parseFloat(unit.sellingPrice) || 0;
                      const pieceProfit = pieceSell > 0 && costPerPiece > 0 ? pieceSell - costPerPiece : 0;
                      const pieceMargin = pieceSell > 0 && costPerPiece > 0 ? ((pieceSell - costPerPiece) / pieceSell) * 100 : 0;
                      const totalCartonProfit = pieceProfit * itemsInPkg;

                      return (
                        <div key={index} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-2">
                              <Package className="h-4 w-4 text-indigo-500" />
                              Bulk Ratio #{index + 1}: 1 {unit.purchaseUnitName || "Carton"} = {unit.unitsPerPackage || "10"} {unit.sellingUnitName || "Pieces"}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePackagingUnit(index)}
                              className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                              title="Remove this ratio"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                            {/* 1. Buy As Container */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Buy As (Container)</label>
                              <Input
                                value={unit.purchaseUnitName}
                                onChange={(e) => updatePackagingUnit(index, "purchaseUnitName", e.target.value)}
                                placeholder="Carton"
                                className="h-10 text-xs font-bold rounded-xl"
                              />
                            </div>

                            {/* 2. Bulk Cost from Supplier */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Purchase Cost / {unit.purchaseUnitName || "Carton"} (Le) *</label>
                              <Input
                                type="number"
                                value={unit.purchaseCost}
                                onChange={(e) => {
                                  updatePackagingUnit(index, "purchaseCost", e.target.value);
                                  const ratio = parseFloat(unit.unitsPerPackage) || 1;
                                  const cCost = parseFloat(e.target.value) || 0;
                                  if (index === 0) {
                                    setFormData(prev => ({ ...prev, costPrice: (cCost / ratio).toString() }));
                                  }
                                }}
                                placeholder="0.00"
                                className="h-10 text-xs font-mono font-bold rounded-xl text-rose-600 dark:text-rose-400"
                                required
                              />
                            </div>

                            {/* 3. Items per Package */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Pieces inside 1 {unit.purchaseUnitName || "Carton"} *</label>
                              <Input
                                type="number"
                                value={unit.unitsPerPackage}
                                onChange={(e) => {
                                  updatePackagingUnit(index, "unitsPerPackage", e.target.value);
                                  const ratio = parseFloat(e.target.value) || 1;
                                  const bCost = parseFloat(unit.purchaseCost) || 0;
                                  if (index === 0 && bCost > 0) {
                                    setFormData(prev => ({ ...prev, costPrice: (bCost / ratio).toString() }));
                                  }
                                }}
                                placeholder="10"
                                className="h-10 text-xs font-mono font-bold rounded-xl text-indigo-600 dark:text-indigo-400"
                                required
                              />
                            </div>

                            {/* 4. Sell Unit Name */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Sell Retail As</label>
                              <Input
                                value={unit.sellingUnitName}
                                onChange={(e) => updatePackagingUnit(index, "sellingUnitName", e.target.value)}
                                placeholder="Piece"
                                className="h-10 text-xs font-bold rounded-xl"
                              />
                            </div>

                            {/* 5. Sell Cost to Customer per Piece */}
                            <div className="space-y-1 col-span-2 sm:col-span-1">
                              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Sell Cost / {unit.sellingUnitName || "Piece"} (Le) *</label>
                              <Input
                                type="number"
                                value={unit.sellingPrice}
                                onChange={(e) => {
                                  updatePackagingUnit(index, "sellingPrice", e.target.value);
                                  if (index === 0) {
                                    setFormData(prev => ({ ...prev, unitPrice: e.target.value }));
                                  }
                                }}
                                placeholder="0.00"
                                className="h-10 text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 rounded-xl"
                                required
                              />
                            </div>
                          </div>

                          {/* Live Telemetry Card per Bulk Tier */}
                          {costPerPiece > 0 && pieceSell > 0 && (
                            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-500">
                                    Purchase Cost: <strong className="text-rose-600 dark:text-rose-400 font-bold">Le {Math.round(costPerPiece).toLocaleString()} / {unit.sellingUnitName || "piece"}</strong>
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-500">
                                    Sell Cost: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">Le {Math.round(pieceSell).toLocaleString()} / {unit.sellingUnitName || "piece"}</strong>
                                  </span>
                                </div>

                                {pieceProfit > 0 ? (
                                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                                    +{pieceMargin.toFixed(0)}% Margin (+Le {Math.round(pieceProfit).toLocaleString()} / {unit.sellingUnitName || "piece"})
                                  </span>
                                ) : (
                                  <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                                    Selling at a Loss (-Le {Math.abs(Math.round(pieceProfit)).toLocaleString()})
                                  </span>
                                )}
                              </div>

                              {pieceProfit > 0 && (
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                                  💡 1 Full {unit.purchaseUnitName || "Carton"} generates <strong>+Le {Math.round(totalCartonProfit).toLocaleString()}</strong> total gross profit when all {unit.unitsPerPackage || "10"} {unit.sellingUnitName || "pieces"} are sold.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {/* Section 3: Stock Quantity */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    3. Stock &amp; Inventory Count
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      {sourcingMode === "bulk" ? "Total Retail Pieces in Stock *" : "How many in stock now? *"}
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 w-12 rounded-2xl border-slate-200 dark:border-slate-800"
                        onClick={() => setFormData({ ...formData, stockQuantity: Math.max(0, parseInt(formData.stockQuantity || "0") - 1).toString() })}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                        placeholder="0"
                        className="h-12 font-mono font-black text-center text-lg rounded-2xl"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 w-12 rounded-2xl border-slate-200 dark:border-slate-800"
                        onClick={() => setFormData({ ...formData, stockQuantity: (parseInt(formData.stockQuantity || "0") + 1).toString() })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Alert me when stock is low
                    </Label>
                    <Input
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                      placeholder="10"
                      className="h-12 font-mono font-bold text-sm rounded-2xl"
                    />
                    <span className="text-[10px] text-slate-400">Shows warning when below this count</span>
                  </div>
                </div>

                {/* Favorite Toggle */}
                <div className="pt-2 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="isFavorite"
                    checked={formData.isFavorite || false}
                    onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <Label htmlFor="isFavorite" className="text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <Star className={cn("h-3.5 w-3.5", formData.isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-400")} />
                    Star this item for quick POS checkout
                  </Label>
                </div>
              </div>
                </motion.div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                className="h-12 px-6 rounded-2xl font-bold text-xs"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sourcingMode === null}
                className={cn(
                  "h-12 px-8 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all",
                  sourcingMode === null
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:scale-105 active:scale-95"
                )}
              >
                {editingProduct ? "Save Changes" : "Save Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. DELETE PRODUCT CONFIRMATION MODAL */}
      <ConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, open }))}
        title="Delete Inventory Product"
        description={
          <>
            Are you sure you want to permanently delete{" "}
            <code className="text-rose-600 dark:text-rose-400 font-mono text-[11px] bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
              {deleteModal.name}
            </code>
            ?
          </>
        }
        confirmWord="DELETE"
        confirmLabel="Delete Product"
        loadingLabel="Deleting…"
        warningNote="All stock records and pricing for this item will be removed."
        onConfirm={() => handleDelete(deleteModal.id)}
      />

    </div>
  );
}
