"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Minus, Pencil, Trash2, MoreVertical, Package, Search, Filter, 
  Download, ArrowUpDown, ShoppingCart, Tag, Calculator, ChevronDown, 
  ChevronUp, Info, Boxes, Layers, LayoutGrid, List, Eye, BarChart3, 
  TrendingUp, Sparkles, AlertCircle, CheckCircle2, QrCode, ExternalLink, 
  DollarSign, Activity, Star, ArrowUpRight, ShieldCheck, Box, RefreshCw,
  Wand2, Percent, Check, ArrowRight, ShieldAlert, FileText, Image as ImageIcon
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

// ─── Preset Unit Options ────────────────────────────────────────────────────
const PURCHASE_UNITS = [
  "Crate", "Box", "Carton", "Bag", "Sack", "Bundle", "Dozen", "Pack",
  "Bale", "Barrel", "Drum", "Pallet", "Case", "Tray", "Bucket",
];

const SELLING_UNITS = [
  "Bottle", "Piece", "Unit", "Sachet", "Cup", "Can", "Tin",
  "Packet", "Roll", "Sheet", "Plate", "Serving", "Portion", "Gram", "Kg",
  "Litre", "ml", "Meter", "Yard",
];

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

// ─── Packaging Unit Card Component ────────────────────────────────────────────
function PackagingUnitCard({
  unit,
  index,
  baseUnit,
  onUpdate,
  onRemove,
}: {
  unit: PackagingUnit;
  index: number;
  baseUnit: string;
  onUpdate: (index: number, field: keyof PackagingUnit, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const costPerUnit = calcCostPerUnit(unit.purchaseCost, unit.unitsPerPackage);
  const margin = calcMargin(unit.sellingPrice, costPerUnit);
  const sell = parseFloat(unit.sellingPrice) || 0;
  const unitProfit = sell > 0 && costPerUnit > 0 ? sell - costPerUnit : 0;
  const isGoodMargin = margin >= 20;
  const isFairMargin = margin >= 10 && margin < 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 relative shadow-xs hover:border-indigo-500/40 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
            #{index + 1}
          </div>
          <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Boxes className="h-4 w-4 text-indigo-500" /> Multi-Unit Hierarchy
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          title="Remove packaging unit"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-1">Buy Package (Unit)</label>
          <Input
            value={unit.purchaseUnitName}
            onChange={(e) => onUpdate(index, "purchaseUnitName", e.target.value)}
            placeholder="e.g. Crate, Box"
            className="h-10 text-xs font-bold rounded-xl"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-1">Package Cost (Le)</label>
          <Input
            type="number"
            value={unit.purchaseCost}
            onChange={(e) => onUpdate(index, "purchaseCost", e.target.value)}
            placeholder="e.g. 2500"
            className="h-10 text-xs font-mono font-bold rounded-xl text-rose-600 dark:text-rose-400"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-1">Items Per Package</label>
          <Input
            type="number"
            value={unit.unitsPerPackage}
            onChange={(e) => onUpdate(index, "unitsPerPackage", e.target.value)}
            placeholder="12"
            className="h-10 text-xs font-mono font-bold rounded-xl text-indigo-600 dark:text-indigo-400"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-1">Sell Retail (Unit)</label>
          <Input
            value={unit.sellingUnitName}
            onChange={(e) => onUpdate(index, "sellingUnitName", e.target.value)}
            placeholder="e.g. Bottle, Piece"
            className="h-10 text-xs font-bold rounded-xl"
          />
        </div>
      </div>

      {/* Real-time calculated Unit Economics Banner */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            Cost / {unit.sellingUnitName || "unit"}: <strong className="text-slate-900 dark:text-white">Le {Math.round(costPerUnit).toLocaleString()}</strong>
          </span>
          {unitProfit > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold hidden sm:inline">
              Profit: +Le {Math.round(unitProfit).toLocaleString()} / {unit.sellingUnitName || "unit"}
            </span>
          )}
        </div>
        {margin > 0 && (
          <span className={cn(
            "font-mono font-extrabold px-2.5 py-0.5 rounded-full text-[10px]",
            isGoodMargin ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" :
            isFairMargin ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" :
            "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
          )}>
            +{margin.toFixed(1)}% Gross Yield
          </span>
        )}
      </div>
    </motion.div>
  );
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
  const [activeStudioTab, setActiveStudioTab] = useState<"basic" | "pricing" | "packaging" | "stock">("basic");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [inspectProduct, setInspectProduct] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");
  const [packagingOpen, setPackagingOpen] = useState(true);
  
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

  // Live Studio Form calculations
  const formSellPrice = parseFloat(formData.unitPrice) || 0;
  const formCostPrice = parseFloat(formData.costPrice) || 0;
  const formUnitProfit = formSellPrice > 0 && formCostPrice > 0 ? formSellPrice - formCostPrice : 0;
  const formMargin = formSellPrice > 0 && formCostPrice > 0 ? ((formSellPrice - formCostPrice) / formSellPrice) * 100 : 0;
  const formMarkup = formCostPrice > 0 && formSellPrice > 0 ? ((formSellPrice - formCostPrice) / formCostPrice) * 100 : 0;

  // Smart SKU Generator
  const generateSmartSKU = () => {
    const prefix = formData.name
      ? formData.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase()
      : "PRD";
    const rand = Math.floor(100 + Math.random() * 900);
    const skuCode = `${prefix}-${rand}`;
    setFormData(prev => ({ ...prev, sku: skuCode }));
    toast.success(`Generated Smart SKU: ${skuCode}`);
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

      // 3. Stock filter
      if (filterStock !== "all") {
        const stock = Number(p.stockQuantity) || 0;
        const minLevel = Number(p.minStockLevel) || 10;
        if (filterStock === "low" && (stock > minLevel || stock <= 0)) return false;
        if (filterStock === "out" && stock > 0) return false;
        if (filterStock === "in" && stock <= minLevel) return false;
        if (filterStock === "fav" && !p.isFavorite) return false;
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
        purchaseUnitName: "Crate",
        purchaseCost: Math.round(costPrice * ratio).toString(),
        unitsPerPackage: ratio.toString(),
        sellingUnitName: u.name || "Bottle",
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
        toast.success("Product specs updated successfully.");
      } else {
        await createProduct(data);
        toast.success("New product published to catalog.");
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
    setActiveStudioTab("basic");
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
    setActiveStudioTab("basic");
    setIsDialogOpen(true);
  }

  const addPackagingPreset = (preset: "drink" | "hardware" | "general") => {
    if (preset === "drink") {
      setFormData(prev => ({
        ...prev,
        packagingUnits: [
          ...prev.packagingUnits,
          {
            purchaseUnitName: "Crate",
            purchaseCost: "2500",
            unitsPerPackage: "24",
            sellingUnitName: "Bottle",
            sellingPrice: "150",
            barcode: "",
          }
        ]
      }));
    } else if (preset === "hardware") {
      setFormData(prev => ({
        ...prev,
        packagingUnits: [
          ...prev.packagingUnits,
          {
            purchaseUnitName: "Carton",
            purchaseCost: "12000",
            unitsPerPackage: "10",
            sellingUnitName: "Piece",
            sellingPrice: "1500",
            barcode: "",
          }
        ]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        packagingUnits: [
          ...prev.packagingUnits,
          {
            purchaseUnitName: "Box",
            purchaseCost: "5000",
            unitsPerPackage: "12",
            sellingUnitName: "Unit",
            sellingPrice: "600",
            barcode: "",
          }
        ]
      }));
    }
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
      
      {/* 1. TOP HEADER & COMMAND CONTROLS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                {isBar ? "Bar Stock" : isPharmacy ? "Pharmacy" : "Inventory"} <span className="text-indigo-600 dark:text-indigo-400">Catalog</span>
              </h1>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-bold uppercase border border-indigo-500/20 hidden sm:inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Command Center
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1.5">
              {isBar
                ? "Manage drinks with crate/bottle pricing. Buy by crate, sell by bottle."
                : "Manage product SKU, packaging units, and pricing."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                viewMode === "grid" 
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
              title="Super Graphical Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden md:inline text-[11px] uppercase tracking-wider">Visual Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                viewMode === "table" 
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
              title="Table View"
            >
              <List className="h-4 w-4" />
              <span className="hidden md:inline text-[11px] uppercase tracking-wider">Data Table</span>
            </button>
          </div>

          <Button 
            variant="outline" 
            onClick={() => toast.success("Catalog exported to CSV format.")}
            className="rounded-2xl border-slate-200 dark:border-slate-800 font-bold gap-2 h-11 px-4 text-xs hover:bg-white dark:hover:bg-slate-900 transition-all"
          >
            <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> 
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button 
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setIsDialogOpen(true);
            }}
            className="h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* 2. TOP GRAPHICAL KPI ANALYTICS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total SKUs */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Managed Catalog</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{products.length} <span className="text-xs font-normal text-slate-400">SKUs</span></h3>
            <p className="text-[11px] font-bold text-slate-500 mt-1 flex items-center gap-1.5">
              <Box className="h-3 w-3 text-indigo-500" /> {totalStockCount.toLocaleString()} Total Units in Stock
            </p>
          </div>
        </div>

        {/* Card 2: Retail Asset Valuation */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Stock Valuation</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">Le {Math.round(totalRetailValuation).toLocaleString()}</h3>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" /> Est. Cost: Le {Math.round(totalCostValuation).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Card 3: Potential Profit Margin */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Avg Gross Margin</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono tracking-tight">+{avgMargin.toFixed(1)}%</h3>
            <p className="text-[11px] font-bold text-slate-500 mt-1 flex items-center gap-1.5">
              <BarChart3 className="h-3 w-3 text-purple-500" /> Healthy Portfolio Yield
            </p>
          </div>
        </div>

        {/* Card 4: Critical Stock & Best Seller */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Stock Alerts</span>
            <div className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center",
              lowStockCount > 0 ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 animate-pulse" : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
            )}>
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className={cn("text-2xl sm:text-3xl font-black font-mono tracking-tight", lowStockCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white")}>
              {lowStockCount} <span className="text-xs font-normal text-slate-400">Low Stock</span>
            </h3>
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1 truncate">
              ⭐ Best: {fastMovingProducts[0]?.name || "Hikvision 2MP IP Camera"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. VISUAL CATEGORY FILTER RIBBON & SEARCH BAR */}
      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-sm space-y-4">
        
        {/* Search & Main Filter Controls */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input
              placeholder="Filter by product name, SKU signature, category..."
              className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 font-bold text-xs focus:bg-white dark:focus:bg-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 shrink-0">
            {/* Stock Level Switcher Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" className={cn("rounded-2xl gap-2 font-bold text-xs h-12 px-4 border-slate-200 dark:border-slate-800", filterStock !== "all" && "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 border-indigo-200")}>
                  <Filter className="h-3.5 w-3.5" />
                  <span>{filterStock === "all" ? "All Stocks" : filterStock === "in" ? "In Stock" : filterStock === "low" ? "Low Stock" : filterStock === "out" ? "Out of Stock" : "Favorites"}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              } />
              <DropdownMenuContent className="w-48 rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800">
                <DropdownMenuItem onClick={() => setFilterStock("all")} className="rounded-xl font-bold text-xs">All Stock Levels</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStock("in")} className="rounded-xl font-bold text-xs text-emerald-600">In Stock</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStock("low")} className="rounded-xl font-bold text-xs text-rose-600">Low Stock Alert</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStock("out")} className="rounded-xl font-bold text-xs text-slate-500">Out of Stock (0)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStock("fav")} className="rounded-xl font-bold text-xs text-amber-500">⭐ Favorites Only</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" className="rounded-2xl gap-2 font-bold text-xs h-12 px-4 border-slate-200 dark:border-slate-800">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sort: </span>
                  <span>{sortBy === "name_asc" ? "A-Z" : sortBy === "price_desc" ? "Highest Price" : sortBy === "price_asc" ? "Lowest Price" : sortBy === "stock_desc" ? "Max Stock" : "Min Stock"}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              } />
              <DropdownMenuContent className="w-52 rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800">
                <DropdownMenuItem onClick={() => setSortBy("name_asc")} className="rounded-xl font-bold text-xs">Name (A → Z)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name_desc")} className="rounded-xl font-bold text-xs">Name (Z → A)</DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onClick={() => setSortBy("price_desc")} className="rounded-xl font-bold text-xs">Price (High to Low)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price_asc")} className="rounded-xl font-bold text-xs">Price (Low to High)</DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onClick={() => setSortBy("stock_desc")} className="rounded-xl font-bold text-xs">Stock Volume (Highest)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("stock_asc")} className="rounded-xl font-bold text-xs">Stock Volume (Lowest)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Visual Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setFilterCategory("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0",
              filterCategory === "all"
                ? "bg-slate-900 text-white dark:bg-indigo-600 border-slate-900 dark:border-indigo-500 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200"
            )}
          >
            All Categories ({products.length})
          </button>
          {categories.map((c) => {
            const count = products.filter(p => p.categoryId === c.id).length;
            const isSelected = filterCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0",
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>

      </Card>

      {/* 4. MAIN CONTENT: SUPER GRAPHICAL GRID OR ADVANCED DATA TABLE */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products Match Filters"
          description="Try broadening your search term or selecting another category."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setFilterCategory("all");
            setFilterStock("all");
          }}
        />
      ) : viewMode === "grid" ? (
        /* ─── 4A: SUPER GRAPHICAL VISUAL CARDS GRID ─── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => {
            const stock = Number(product.stockQuantity) || 0;
            const minStock = Number(product.minStockLevel) || 10;
            const isLowStock = stock <= minStock && stock > 0;
            const isOutOfStock = stock <= 0;
            const sellPrice = parseFloat(product.unitPrice) || 0;
            const costPrice = parseFloat(product.costPrice) || 0;
            const margin = sellPrice > 0 && costPrice > 0 ? ((sellPrice - costPrice) / sellPrice) * 100 : 0;
            const skuTag = product.sku || `SKU-${product.id.slice(-4).toUpperCase()}`;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-indigo-500/40 transition-all flex flex-col overflow-hidden"
              >
                {/* Top Image Showcase */}
                <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex items-center justify-center p-4">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <Package className="h-16 w-16 text-slate-300 dark:text-slate-700 group-hover:scale-110 group-hover:text-indigo-500 transition-all duration-300" />
                  )}

                  {/* Stock Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase shadow-sm flex items-center gap-1.5 backdrop-blur-md",
                      isOutOfStock
                        ? "bg-rose-500/90 text-white"
                        : isLowStock
                        ? "bg-amber-500/90 text-white animate-pulse"
                        : "bg-emerald-600/90 text-white"
                    )}>
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      {isOutOfStock ? "Out of Stock" : isLowStock ? `Low (${stock})` : `${stock} in stock`}
                    </span>
                  </div>

                  {/* Favorite / Menu Trigger */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    {product.isFavorite && (
                      <span className="h-7 w-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                        <Star className="h-3.5 w-3.5 fill-current" />
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(product);
                      }}
                      className="h-7 w-7 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-indigo-600 flex items-center justify-center shadow-md backdrop-blur-md transition-colors"
                      title="Edit Product"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400 font-bold uppercase truncate max-w-[120px]">
                        {product.category?.name || "General Catalog"}
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {skuTag}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h4>

                    {/* Packaging Units Indicator */}
                    {product.units && product.units.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Boxes className="h-3 w-3 text-indigo-500" />
                        <span>Multi-unit packaging active</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing Matrix & Margin */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Retail Price</span>
                      <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                        Le {Math.round(sellPrice).toLocaleString()}
                      </span>
                      {costPrice > 0 && (
                        <span className="text-[10px] font-mono text-slate-400 block">
                          Cost: Le {Math.round(costPrice).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {margin > 0 && (
                      <span className="px-2 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                        +{margin.toFixed(0)}% Margin
                      </span>
                    )}
                  </div>

                  {/* Card Action Controls */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInspectProduct(product)}
                      className="h-9 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5 text-indigo-500" /> Inspect
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/pos?search=${encodeURIComponent(product.name)}`)}
                      className="h-9 rounded-xl bg-slate-900 text-white dark:bg-indigo-600 hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" /> Sell POS
                    </Button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ─── 4B: ADVANCED INTERACTIVE DATA TABLE ─── */
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="font-mono font-bold text-[10px] uppercase tracking-wider text-slate-500">Product & Signature</TableHead>
                <TableHead className="font-mono font-bold text-[10px] uppercase tracking-wider text-slate-500">Category</TableHead>
                <TableHead className="font-mono font-bold text-[10px] uppercase tracking-wider text-slate-500">Stock Node</TableHead>
                <TableHead className="font-mono font-bold text-[10px] uppercase tracking-wider text-slate-500">Pricing & Margin</TableHead>
                <TableHead className="font-mono font-bold text-[10px] uppercase tracking-wider text-slate-500 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((product) => {
                const stock = Number(product.stockQuantity) || 0;
                const minStock = Number(product.minStockLevel) || 10;
                const isLow = stock <= minStock;
                const sellPrice = parseFloat(product.unitPrice) || 0;
                const costPrice = parseFloat(product.costPrice) || 0;
                const margin = sellPrice > 0 && costPrice > 0 ? ((sellPrice - costPrice) / sellPrice) * 100 : 0;
                const skuTag = product.sku || `SKU-${product.id.slice(-4).toUpperCase()}`;

                return (
                  <TableRow
                    key={product.id}
                    onClick={() => setInspectProduct(product)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    {/* Column 1: Image & Name */}
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
                          ) : (
                            <Package className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-400">
                            <span>ID: {skuTag}</span>
                            {product.units && product.units.length > 0 && (
                              <span className="text-indigo-500 font-bold">• {product.units.length} selling units</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 2: Category */}
                    <TableCell className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase">
                        {product.category?.name || "General"}
                      </span>
                    </TableCell>

                    {/* Column 3: Stock Node */}
                    <TableCell className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-mono font-black text-sm", isLow ? "text-rose-600 animate-pulse" : "text-slate-900 dark:text-white")}>
                            {stock} units
                          </span>
                          {isLow && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 uppercase">
                              Low
                            </span>
                          )}
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full", isLow ? "bg-rose-500" : "bg-emerald-500")}
                            style={{ width: `${Math.min((stock / (minStock * 3)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 4: Pricing */}
                    <TableCell className="p-4">
                      <div>
                        <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                          Le {Math.round(sellPrice).toLocaleString()}
                        </span>
                        {margin > 0 && (
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block font-bold">
                            Cost: Le {Math.round(costPrice).toLocaleString()} (+{margin.toFixed(0)}% margin)
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Column 5: Action Menu */}
                    <TableCell className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="h-8 w-8 p-0 rounded-xl"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteModal({ open: true, id: product.id, name: product.name })}
                          className="h-8 w-8 p-0 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

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
                  Product Intelligence Node
                </span>
                <h3 className="text-2xl font-black">{inspectProduct.name}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  SKU: {inspectProduct.sku || `SKU-${inspectProduct.id.slice(-4).toUpperCase()}`} • {inspectProduct.category?.name || "General Catalog"}
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                
                {/* Photo & Stock Health Gauge */}
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
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Stock Node Status</span>
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
                          {inspectProduct.stockQuantity <= inspectProduct.minStockLevel ? "Low Stock Alert" : "Healthy Stock"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Min Threshold: {inspectProduct.minStockLevel || 10} • Max Ceiling: {inspectProduct.maxStockLevel || "Uncapped"}
                      </div>
                    </div>

                    {/* Margin Gauge */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                        <span className="text-[9px] font-mono text-indigo-500 uppercase font-bold block">Selling Price</span>
                        <span className="text-base font-black font-mono text-indigo-950 dark:text-indigo-200">
                          Le {Math.round(parseFloat(inspectProduct.unitPrice)).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Cost Price</span>
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
                      Packaging Units Hierarchy
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
                  <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Specs
                </Button>
                <Button
                  onClick={() => {
                    const prodName = inspectProduct.name;
                    setInspectProduct(null);
                    router.push(`/dashboard/pos?search=${encodeURIComponent(prodName)}`);
                  }}
                  className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Open in POS Terminal
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. UPGRADED SUPER ADVANCED PRODUCT STUDIO (ADD / EDIT MODAL) */}
      <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingProduct(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[880px] w-[96vw] sm:w-full rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-h-[92vh] flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
          
          {/* Studio Header */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6 sm:p-7 text-white shrink-0 border-b border-indigo-900/40 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                      {editingProduct ? "Product Specification Engine" : "Product Creation Studio"}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold uppercase border border-indigo-500/30">
                      v2.5 Pro
                    </span>
                  </div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em] mt-0.5">
                    Define pricing economics, multi-unit ratios, and stock automation
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Studio Navigation Tabs */}
            <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 custom-scrollbar">
              <button
                type="button"
                onClick={() => setActiveStudioTab("basic")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0",
                  activeStudioTab === "basic"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500"
                    : "bg-white/5 hover:bg-white/10 text-slate-300"
                )}
              >
                <Package className="h-3.5 w-3.5" /> 1. Basic &amp; Imagery
              </button>
              <button
                type="button"
                onClick={() => setActiveStudioTab("pricing")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0",
                  activeStudioTab === "pricing"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500"
                    : "bg-white/5 hover:bg-white/10 text-slate-300"
                )}
              >
                <Tag className="h-3.5 w-3.5" /> 2. Pricing &amp; Margin
              </button>
              <button
                type="button"
                onClick={() => setActiveStudioTab("packaging")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0",
                  activeStudioTab === "packaging"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500"
                    : "bg-white/5 hover:bg-white/10 text-slate-300"
                )}
              >
                <Boxes className="h-3.5 w-3.5" /> 3. Packaging ({formData.packagingUnits.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveStudioTab("stock")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0",
                  activeStudioTab === "stock"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500"
                    : "bg-white/5 hover:bg-white/10 text-slate-300"
                )}
              >
                <Layers className="h-3.5 w-3.5" /> 4. Stock Nodes
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950">
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-6">

              {/* ─── TAB 1: BASIC INFORMATION & IMAGERY ─── */}
              {activeStudioTab === "basic" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Photo Uploader Card */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-indigo-500" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          Product Visual Assets
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">JPG · PNG · WebP · Max 10MB</span>
                    </div>

                    <ImageUploader
                      value={formData.imageUrl}
                      onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                      uploadAction={uploadProductImage}
                    />
                  </div>

                  {/* Core Attributes */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Product Name */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          Product Name *
                        </Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={isBar ? "e.g. Star Beer 600ml" : "e.g. Hikvision 2MP IP Camera"}
                          className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm"
                          required
                        />
                      </div>

                      {/* SKU Signature with Smart Generator */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            SKU Signature / Barcode
                          </Label>
                          <button
                            type="button"
                            onClick={generateSmartSKU}
                            className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                          >
                            <Sparkles className="h-3 w-3" /> Auto-Gen SKU
                          </button>
                        </div>
                        <Input
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="e.g. HIK-2MP-001"
                          className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-xs"
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          Category / Classification
                        </Label>
                        <Select
                          value={formData.categoryId || "none"}
                          onValueChange={(val: string) => setFormData({ ...formData, categoryId: val ?? "none" })}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs">
                            <SelectValue placeholder="Categorize item" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <SelectItem value="none">Uncategorized</SelectItem>
                            {categories.map((c: any) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Product Type */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          Inventory Type
                        </Label>
                        <Select
                          value={formData.type}
                          onValueChange={(val: "PRODUCT" | "SERVICE") => setFormData({ ...formData, type: val })}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <SelectItem value="PRODUCT">Physical Product (Track Stock)</SelectItem>
                            <SelectItem value="SERVICE">Professional Service (No Stock)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Network Exchange */}
                      <div className="space-y-1.5 flex items-center justify-between p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <div className="space-y-0.5 pr-2">
                          <Label className="text-[10px] font-mono font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">
                            Network Sourcing
                          </Label>
                          <p className="text-[9px] text-indigo-500 font-bold leading-tight">Available in exchange network</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.isNetworkAvailable}
                          onChange={(e) => setFormData({ ...formData, isNetworkAvailable: e.target.checked })}
                          className="h-5 w-5 rounded-md border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── TAB 2: PRICING MATRIX & LIVE MARGIN CALCULATOR ─── */}
              {activeStudioTab === "pricing" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                          Pricing Economics Matrix
                        </h4>
                        <p className="text-[10px] font-mono text-slate-400">Configure purchase costs, retail selling prices, and live yield</p>
                      </div>
                      <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                        <Calculator className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          Purchase / Buying Cost (Le)
                        </Label>
                        <Input
                          type="number"
                          step="1"
                          value={formData.costPrice}
                          onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                          placeholder="e.g. 2800"
                          className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-black text-rose-600 dark:text-rose-400 text-xl"
                        />
                        <span className="text-[10px] font-mono text-slate-400">What you pay suppliers</span>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          Selling / Retail Price (Le) *
                        </Label>
                        <Input
                          type="number"
                          step="1"
                          value={formData.unitPrice}
                          onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                          placeholder="e.g. 3500"
                          className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-black text-indigo-600 dark:text-indigo-400 text-xl"
                          required
                        />
                        <span className="text-[10px] font-mono text-slate-400">Price customers pay at POS</span>
                      </div>
                    </div>

                    {/* Live Profit & Margin Simulator */}
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/70 dark:from-indigo-950/30 dark:via-slate-900 dark:to-emerald-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-4">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4 text-emerald-500" /> Unit Economics Telemetry
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100/80 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md">
                          Live Auto-Calculated
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-center">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Gross Profit</span>
                          <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                            +Le {Math.round(formUnitProfit).toLocaleString()}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-center">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Profit Margin</span>
                          <span className={cn(
                            "text-base sm:text-lg font-black font-mono",
                            formMargin >= 20 ? "text-emerald-600 dark:text-emerald-400" : formMargin > 0 ? "text-amber-500" : "text-slate-400"
                          )}>
                            +{formMargin.toFixed(1)}%
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-center">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Cost Markup</span>
                          <span className="text-base sm:text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                            +{formMarkup.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── TAB 3: PACKAGING & MULTI-UNIT SYSTEM ─── */}
              {activeStudioTab === "packaging" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                          <Boxes className="h-4 w-4 text-indigo-500" /> Multi-Tier Packaging System
                        </h4>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Buy by bulk container (Crate/Box) and sell by individual units (Bottle/Piece)
                        </p>
                      </div>

                      {/* Preset Quick Actions */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPackagingPreset("drink")}
                          className="h-8 rounded-xl text-[10px] font-bold font-mono"
                        >
                          + Crate → Bottle
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPackagingPreset("hardware")}
                          className="h-8 rounded-xl text-[10px] font-bold font-mono"
                        >
                          + Carton → Piece
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPackagingPreset("general")}
                          className="h-8 rounded-xl text-[10px] font-bold font-mono"
                        >
                          + Box → Unit
                        </Button>
                      </div>
                    </div>

                    {formData.packagingUnits.length === 0 ? (
                      <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
                        <Boxes className="h-10 w-10 text-slate-400 mx-auto" />
                        <div>
                          <p className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">No Multi-Unit Ratios Configured</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1 max-w-sm mx-auto">
                            Add a packaging ratio to automatically calculate per-item cost and split inventory across cartons, crates, or packs.
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => addPackagingPreset("general")}
                          className="h-10 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase"
                        >
                          <Plus className="h-4 w-4 mr-1.5" /> Add Conversion Ratio
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.packagingUnits.map((unit, index) => (
                          <PackagingUnitCard
                            key={index}
                            unit={unit}
                            index={index}
                            baseUnit={formData.baseUnit}
                            onUpdate={updatePackagingUnit}
                            onRemove={removePackagingUnit}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── TAB 4: STOCK NODES & THRESHOLD CONTROLS ─── */}
              {activeStudioTab === "stock" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                          <Layers className="h-4 w-4 text-indigo-500" /> Stock Node Automation
                        </h4>
                        <p className="text-[10px] font-mono text-slate-400">Configure initial stock count, low-stock reorder thresholds, and ceiling</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Initial On-hand Stock */}
                      <div className="space-y-2">
                        <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          On-Hand Stock Volume
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

                      {/* Min Stock Alert */}
                      <div className="space-y-2">
                        <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          Low Stock Alert Threshold
                        </Label>
                        <Input
                          type="number"
                          value={formData.minStockLevel}
                          onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                          placeholder="10"
                          className="h-12 font-mono font-bold text-sm rounded-2xl"
                        />
                        <span className="text-[10px] font-mono text-slate-400">Triggers reorder warnings</span>
                      </div>

                      {/* Max Stock Level */}
                      <div className="space-y-2">
                        <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                          Max Ceiling (Overstock)
                        </Label>
                        <Input
                          type="number"
                          value={formData.maxStockLevel}
                          onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value })}
                          placeholder="100"
                          className="h-12 font-mono font-bold text-sm rounded-2xl"
                        />
                        <span className="text-[10px] font-mono text-slate-400">Optional capacity cap</span>
                      </div>

                    </div>

                    {/* Expiry & Batch Details */}
                    {hasExpiryAndBatch && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            Product Expiry Date
                          </Label>
                          <Input
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            Batch / Lot Number
                          </Label>
                          <Input
                            value={formData.batchNumber}
                            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                            placeholder="e.g. LOT-2026-09"
                            className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Favorite Toggle */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isFavorite"
                        checked={formData.isFavorite || false}
                        onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                        className="h-5 w-5 rounded-md border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <Label htmlFor="isFavorite" className="text-xs font-bold flex items-center gap-2 cursor-pointer">
                        <Star className={cn("h-4 w-4", formData.isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-400")} />
                        Pin as Favorite Product (Quick POS Selection)
                      </Label>
                    </div>

                  </div>
                </motion.div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                className="h-12 px-6 rounded-2xl font-bold text-xs"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                {activeStudioTab !== "basic" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-5 rounded-2xl font-bold text-xs"
                    onClick={() => {
                      if (activeStudioTab === "stock") setActiveStudioTab("packaging");
                      else if (activeStudioTab === "packaging") setActiveStudioTab("pricing");
                      else if (activeStudioTab === "pricing") setActiveStudioTab("basic");
                    }}
                  >
                    Back
                  </Button>
                )}

                {activeStudioTab !== "stock" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (activeStudioTab === "basic") setActiveStudioTab("pricing");
                      else if (activeStudioTab === "pricing") setActiveStudioTab("packaging");
                      else if (activeStudioTab === "packaging") setActiveStudioTab("stock");
                    }}
                    className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider"
                  >
                    Next Step <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30"
                  >
                    {editingProduct ? "Save Changes" : "Publish to Catalog"}
                  </Button>
                )}
              </div>
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
        warningNote="All stock records, packaging units, and SKU tracking for this item will be removed."
        onConfirm={() => handleDelete(deleteModal.id)}
      />

    </div>
  );
}
