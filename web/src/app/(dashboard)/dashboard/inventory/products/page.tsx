"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Pencil, Trash2, MoreVertical, Package, Search, Filter, Download, ArrowUpDown, ShoppingCart, Tag, Calculator, ChevronDown, ChevronUp, Info, Boxes, Layers } from "lucide-react";
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
  DialogTrigger,
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
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "@/components/shared/empty-state";
import { TouchWrapper } from "@/components/layout/TouchWrapper";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { BackButton } from "@/components/layout/ModuleHeader";

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
  const isGoodMargin = margin > 15;
  const isBadMargin = margin < 5 && margin > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden group"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Boxes className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Packaging #{index + 1}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="h-7 w-7 rounded-full text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="p-5 space-y-4">
        {/* Purchase Unit Section */}
        <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em]">How You Buy (Purchase Unit)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Unit Name</Label>
              <Select
                value={PURCHASE_UNITS.includes(unit.purchaseUnitName) ? unit.purchaseUnitName : (unit.purchaseUnitName ? "__custom" : "")}
                onValueChange={(val: string) => onUpdate(index, "purchaseUnitName", val === "__custom" ? "" : val)}
              >
                <SelectTrigger className="h-10 rounded-xl border-rose-100 dark:border-rose-900/50 bg-white dark:bg-slate-900 font-bold text-xs text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {PURCHASE_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                  <SelectItem value="__custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
              {(!PURCHASE_UNITS.includes(unit.purchaseUnitName) && unit.purchaseUnitName !== "") && (
                <Input
                  value={unit.purchaseUnitName}
                  placeholder="Enter unit name"
                  className="h-9 rounded-xl border-rose-100 dark:border-rose-900/50 bg-white dark:bg-slate-900 font-bold text-xs mt-1 text-slate-900 dark:text-slate-100"
                  onChange={(e) => onUpdate(index, "purchaseUnitName", e.target.value)}
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Purchase Cost (Le)</Label>
              <Input
                type="number"
                step="1"
                value={unit.purchaseCost}
                onChange={(e) => onUpdate(index, "purchaseCost", e.target.value)}
                placeholder="e.g. 250"
                className="h-10 rounded-xl border-rose-100 dark:border-rose-900/50 bg-white dark:bg-slate-900 font-black text-rose-600 dark:text-rose-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Conversion Arrow */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calculator className="h-4 w-4 text-primary" />
            </div>
            <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Units per {unit.purchaseUnitName || "Package"}</Label>
            <Input
              type="number"
              value={unit.unitsPerPackage}
              onChange={(e) => onUpdate(index, "unitsPerPackage", e.target.value)}
              placeholder="24"
              className="h-10 w-28 text-center rounded-xl border-primary/20 bg-primary/5 dark:bg-primary/10 font-black text-primary text-sm"
            />
          </div>
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Selling Unit Section */}
        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">How You Sell (Selling Unit)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Unit Name</Label>
              <Select
                value={SELLING_UNITS.includes(unit.sellingUnitName) ? unit.sellingUnitName : (unit.sellingUnitName ? "__custom" : "")}
                onValueChange={(val: string) => onUpdate(index, "sellingUnitName", val === "__custom" ? "" : val)}
              >
                <SelectTrigger className="h-10 rounded-xl border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-slate-900 font-bold text-xs text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {SELLING_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                  <SelectItem value="__custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
              {(!SELLING_UNITS.includes(unit.sellingUnitName) && unit.sellingUnitName !== "") && (
                <Input
                  value={unit.sellingUnitName}
                  placeholder="Enter unit name"
                  className="h-9 rounded-xl border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-slate-900 font-bold text-xs mt-1 text-slate-900 dark:text-slate-100"
                  onChange={(e) => onUpdate(index, "sellingUnitName", e.target.value)}
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Selling Price (Le)</Label>
              <Input
                type="number"
                step="1"
                value={unit.sellingPrice}
                onChange={(e) => onUpdate(index, "sellingPrice", e.target.value)}
                placeholder="e.g. 25"
                className="h-10 rounded-xl border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-slate-900 font-black text-emerald-600 dark:text-emerald-400 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Barcode (Optional)</Label>
            <Input
              value={unit.barcode || ""}
              onChange={(e) => onUpdate(index, "barcode", e.target.value)}
              placeholder="Scan or enter barcode"
              className="h-9 rounded-xl border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-slate-900 font-mono text-[10px] text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Auto-calculated summary */}
        {costPerUnit > 0 && (
          <div className={cn(
            "flex items-center justify-between p-3 rounded-2xl",
            isGoodMargin ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30" :
            isBadMargin ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30" :
            "bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
          )}>
            <div className="space-y-0.5">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Auto-Calculated</p>
              <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                Cost per {unit.sellingUnitName || "unit"}: <span className="text-rose-600">Le {Math.round(costPerUnit).toLocaleString()}</span>
              </p>
              {parseFloat(unit.purchaseCost) > 0 && parseFloat(unit.unitsPerPackage) > 0 && (
                <p className="text-[9px] text-slate-400 font-bold">
                  {unit.purchaseUnitName} Le {unit.purchaseCost} &divide; {unit.unitsPerPackage} {unit.sellingUnitName}s = Le {Math.round(costPerUnit).toLocaleString()} each
                </p>
              )}
            </div>
            {parseFloat(unit.sellingPrice) > 0 && (
              <div className={cn(
                "px-3 py-1.5 rounded-xl text-center min-w-[60px]",
                isGoodMargin ? "bg-emerald-500 text-white" :
                isBadMargin ? "bg-amber-500 text-white" :
                "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              )}>
                <p className="text-[7px] font-black uppercase tracking-widest opacity-75">Margin</p>
                <p className="text-base font-black">{margin.toFixed(1)}%</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function ProductsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [fastMovingProducts, setFastMovingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");
  const [packagingOpen, setPackagingOpen] = useState(true);

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
      setProducts(productsData);
      setCategories(categoriesData);
      setFastMovingProducts(fastMovingData);
    } catch (error) {
      toast.error("Cloud synchronization failed.");
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products
    .filter(p => {
      // 1. Search Query filter
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
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
        unitPrice: primarySellingPrice || parseFloat(formData.unitPrice),
        costPrice: primaryCostPrice || (formData.costPrice ? parseFloat(formData.costPrice) : 0),
        stockQuantity: formData.type === "SERVICE" ? 0 : parseInt(formData.stockQuantity),
        minStockLevel: formData.type === "SERVICE" ? 0 : parseInt(formData.minStockLevel),
        maxStockLevel: formData.type === "SERVICE" || !formData.maxStockLevel ? null : parseInt(formData.maxStockLevel),
        isFavorite: formData.isFavorite,
        categoryId: formData.categoryId === "none" ? null : formData.categoryId,
        requiresPrescription: isPharmacy ? formData.requiresPrescription : false,
        genericAlternative: isPharmacy ? formData.genericAlternative : null,
        isControlledSubstance: isPharmacy ? formData.isControlledSubstance : false,
        metadata: {
          expiryDate: isPharmacy ? formData.expiryDate : undefined,
          batchNumber: isPharmacy ? formData.batchNumber : undefined,
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
        toast.success("Product created successfully.");
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
  }

  async function handleDelete(id: string) {
    if (confirm("Permanently delete this product? This action cannot be undone.")) {
      try {
        await deleteProduct(id);
        toast.success("Product removed from inventory.");
        fetchData();
      } catch (error) {
        toast.error("Unauthorized operation.");
      }
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
    setIsDialogOpen(true);
  }

  const addPackagingUnit = () => {
    setFormData({
      ...formData,
      packagingUnits: [
        ...formData.packagingUnits,
        {
          purchaseUnitName: isBar ? "Crate" : "Box",
          purchaseCost: "",
          unitsPerPackage: isBar ? "24" : "12",
          sellingUnitName: isBar ? "Bottle" : "Piece",
          sellingPrice: "",
          barcode: "",
        }
      ]
    });
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

  const columns = [
    {
      header: "Product Intelligence",
      isMain: true,
      accessor: (product: any) => (
        <div className="flex items-center gap-4">
          <div className="relative w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500 overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <Package className="h-5 sm:h-6 w-5 sm:w-6 text-slate-400 group-hover:text-primary transition-colors" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-800 dark:text-white text-xs sm:text-sm group-hover:text-primary transition-colors line-clamp-1">{product.name}</span>
            <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ID: {product.sku || "N/A"}</span>
            {product.units && product.units.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {product.units.slice(0, 2).map((u: any, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[7px] font-black uppercase tracking-widest">
                    <Layers className="h-2 w-2" />
                    {u.name}
                  </span>
                ))}
                {product.units.length > 2 && (
                  <span className="text-[7px] font-black text-slate-400">+{product.units.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      header: "SKU / Signature",
      isMeta: true,
      isHiddenMobile: true,
      accessor: (product: any) => <span className="font-mono text-[11px] font-black text-slate-500 dark:text-slate-400">{product.sku || "VOID"}</span>
    },
    {
      header: "Classification",
      isMeta: true,
      accessor: (product: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-black uppercase tracking-tighter group-hover:bg-primary group-hover:text-white transition-all duration-500">
          {product.category?.name || "Uncategorized"}
        </span>
      )
    },
    {
      header: "Stock Node",
      accessor: (product: any) => (
        <div className="flex flex-col items-center lg:items-start">
           <span className={cn("font-black text-sm", product.stockQuantity <= product.minStockLevel ? "text-rose-600 animate-pulse" : "text-slate-800 dark:text-white")}>
             {product.stockQuantity}
           </span>
           <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden shadow-inner hidden lg:block">
              <div
                className={cn("h-full transition-all duration-1000", product.stockQuantity <= product.minStockLevel ? "bg-rose-500" : "bg-emerald-500")}
                style={{ width: `${Math.min((product.stockQuantity / (product.minStockLevel * 4)) * 100, 100)}%` }}
              />
           </div>
        </div>
      )
    },
    {
      header: "Pricing",
      accessor: (product: any) => (
        <div className="space-y-0.5">
          <div className="font-[1000] text-primary text-sm sm:text-base">
            Le {Math.round(parseFloat(product.unitPrice)).toLocaleString()}
          </div>
          {product.costPrice && (
            <div className="text-[9px] font-black text-slate-400">
              Cost: Le {Math.round(parseFloat(product.costPrice)).toLocaleString()}
            </div>
          )}
          {product.units && product.units.length > 0 && (
            <div className="text-[8px] font-black text-emerald-600">
              {product.units.length} selling unit{product.units.length > 1 ? "s" : ""}
            </div>
          )}
        </div>
      )
    },
    ...(isPharmacy ? [{
      header: "Lifecycle",
      accessor: (product: any) => {
        const metadata = (product.metadata as any) || {};
        return metadata.expiryDate ? (
          <span className={cn(
            "inline-flex items-center gap-2 px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-tighter shadow-sm",
            new Date(metadata.expiryDate) < new Date()
              ? "bg-rose-50 text-rose-600 border border-rose-100"
              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
          )}>
            <div className={cn("h-1.5 w-1.5 rounded-full", new Date(metadata.expiryDate) < new Date() ? "bg-rose-500 animate-pulse" : "bg-emerald-500")} />
            {new Date(metadata.expiryDate).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">N/A</span>
        );
      }
    }] : [])
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
              {isBar ? "Bar Stock" : isPharmacy ? "Pharmacy" : "Inventory"} <span className="text-primary">Catalog</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
              {isBar
                ? "Manage drinks with crate/bottle pricing. Buy by crate, sell by bottle."
                : "Manage product SKU, packaging units, and pricing."}
            </p>
            {fastMovingProducts.length > 0 && (
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl w-fit border border-amber-100 dark:border-amber-500/20">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Best Selling: {fastMovingProducts[0].name}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
           <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 font-black gap-2 h-14 px-8 text-[10px] uppercase tracking-widest hover:bg-white dark:hover:bg-slate-900 transition-all">
              <Download className="h-4 w-4 text-primary" /> Export Products
           </Button>
           <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
             setIsDialogOpen(open);
             if (!open) {
               setEditingProduct(null);
               resetForm();
             }
           }}>
             <DialogTrigger render={
               <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black text-[10px] uppercase tracking-[0.2em] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                 <Plus className="h-4 w-4" /> Add Product
               </Button>
             } />
             <DialogContent className="sm:max-w-[750px] w-[95vw] sm:w-full rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
               <div className="bg-slate-900 dark:bg-slate-950 p-6 sm:p-8 text-white shrink-0">
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.3em] mt-1">
                    Define pricing, packaging units, and selling units
                  </p>
               </div>
               <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                 <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                   <div className="space-y-6">

                     {/* Section 1: Basic Info */}
                     <div className="space-y-4">
                       <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                         <Package className="h-4 w-4 text-slate-400" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic Information</span>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Type</Label>
                           <Select
                             value={formData.type}
                             onValueChange={(val: "PRODUCT" | "SERVICE") => setFormData({ ...formData, type: val })}
                           >
                             <SelectTrigger className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-bold text-slate-900 dark:text-slate-100">
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                               <SelectItem value="PRODUCT">Physical Product</SelectItem>
                               <SelectItem value="SERVICE">Professional Service</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                         <div className="space-y-2 flex items-center justify-between p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                           <div className="space-y-0.5 pr-2">
                              <Label className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">Network Exchange</Label>
                              <p className="text-[9px] text-indigo-500 font-bold leading-tight">Sourcing availability</p>
                           </div>
                           <input
                             type="checkbox"
                             checked={formData.isNetworkAvailable}
                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isNetworkAvailable: e.target.checked })}
                             className="h-6 w-6 rounded-lg border-indigo-200 text-indigo-600 focus:ring-indigo-500"
                           />
                         </div>
                         <div className="space-y-2 sm:col-span-2">
                           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Image</Label>
                           <ImageUploader
                             value={formData.imageUrl}
                             onChange={(url) => setFormData({...formData, imageUrl: url})}
                             uploadAction={uploadProductImage}
                           />
                         </div>
                         <div className="space-y-2 sm:col-span-2">
                           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Name</Label>
                           <Input
                             value={formData.name}
                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                             placeholder={isBar ? "e.g. Star Beer 600ml" : "Enter product name"}
                             className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-bold text-slate-900 dark:text-slate-100"
                             required
                           />
                         </div>
                         <div className="space-y-2">
                           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / Code</Label>
                           <Input
                             value={formData.sku}
                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sku: e.target.value })}
                             placeholder="Scan or enter ID"
                             className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-mono text-xs text-slate-900 dark:text-slate-100"
                           />
                         </div>
                         <div className="space-y-2">
                           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</Label>
                           <Select
                             value={formData.categoryId || ""}
                             onValueChange={(val: string) => setFormData({ ...formData, categoryId: val ?? "" })}
                           >
                             <SelectTrigger className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100">
                               <SelectValue placeholder="Categorize item" />
                             </SelectTrigger>
                             <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                               <SelectItem value="none">Uncategorized</SelectItem>
                               {categories.map((c: any) => (
                                 <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                       </div>
                     </div>

                     {/* Section 2: Default Pricing */}
                     <div className="space-y-4">
                       <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                         <Tag className="h-4 w-4 text-slate-400" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           {formData.packagingUnits.length > 0 ? "Default Pricing (Auto-set)" : "Pricing"}
                         </span>
                         {formData.packagingUnits.length > 0 && (
                           <span className="ml-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-[8px] font-black uppercase tracking-widest">
                             Driven by packaging below
                           </span>
                         )}
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Cost / Buying Price (Le)</Label>
                           <Input
                             type="number"
                             step="1"
                             value={
                               formData.packagingUnits.length > 0
                                 ? calcCostPerUnit(
                                     formData.packagingUnits[0]?.purchaseCost || "0",
                                     formData.packagingUnits[0]?.unitsPerPackage || "1"
                                   ).toFixed(0)
                                 : formData.costPrice
                             }
                             onChange={(e) => {
                               if (formData.packagingUnits.length === 0) {
                                 setFormData({ ...formData, costPrice: e.target.value });
                               }
                             }}
                             placeholder="0"
                             readOnly={formData.packagingUnits.length > 0}
                             className={cn(
                               "h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-black text-rose-600 dark:text-rose-500 text-lg",
                               formData.packagingUnits.length > 0 && "opacity-60 cursor-not-allowed"
                             )}
                           />
                         </div>
                         <div className="space-y-2">
                           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selling Price (Le)</Label>
                           <Input
                             type="number"
                             step="1"
                             value={
                               formData.packagingUnits.length > 0
                                 ? formData.packagingUnits[0]?.sellingPrice || ""
                                 : formData.unitPrice
                             }
                             onChange={(e) => {
                               if (formData.packagingUnits.length === 0) {
                                 setFormData({ ...formData, unitPrice: e.target.value });
                               }
                             }}
                             placeholder="0"
                             readOnly={formData.packagingUnits.length > 0}
                             className={cn(
                               "h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-black text-primary dark:text-indigo-400 text-lg",
                               formData.packagingUnits.length > 0 && "opacity-60 cursor-not-allowed"
                             )}
                             required={formData.packagingUnits.length === 0}
                           />
                         </div>
                       </div>
                     </div>

                     {/* Section 3: Packaging & Unit System */}
                     <div className="space-y-4">
                       <button
                         type="button"
                         onClick={() => setPackagingOpen(!packagingOpen)}
                         className="w-full flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800"
                       >
                         <div className="flex items-center gap-2">
                           <Boxes className="h-4 w-4 text-primary" />
                           <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                             Packaging &amp; Unit System
                           </span>
                           {formData.packagingUnits.length > 0 && (
                             <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-[8px] font-black uppercase tracking-widest">
                               {formData.packagingUnits.length} unit{formData.packagingUnits.length > 1 ? "s" : ""} defined
                             </span>
                           )}
                         </div>
                         {packagingOpen
                           ? <ChevronUp className="h-4 w-4 text-slate-400" />
                           : <ChevronDown className="h-4 w-4 text-slate-400" />
                         }
                       </button>

                       <AnimatePresence>
                         {packagingOpen && (
                           <motion.div
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: "auto" }}
                             exit={{ opacity: 0, height: 0 }}
                             className="space-y-4 overflow-hidden"
                           >
                             {/* Info banner */}
                             <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                               <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                               <div>
                                 <p className="text-[10px] font-black text-blue-700 dark:blue-300 uppercase tracking-widest mb-1">How this works</p>
                                 <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold leading-relaxed">
                                   Define how you <strong>buy</strong> (e.g. Crate at Le 250) and how you <strong>sell</strong> (e.g. Bottle at Le 25).
                                   The system automatically calculates your cost per bottle and profit margin.
                                   You can add multiple packaging types — for example, sell by crate AND by bottle.
                                 </p>
                               </div>
                             </div>

                             {/* Packaging unit cards */}
                             <AnimatePresence mode="popLayout">
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
                             </AnimatePresence>

                             <Button
                               type="button"
                               variant="outline"
                               onClick={addPackagingUnit}
                               className="w-full h-12 rounded-2xl border-dashed border-2 border-primary/30 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all gap-2"
                             >
                               <Plus className="h-4 w-4" />
                               {formData.packagingUnits.length === 0
                                 ? `Add Packaging Unit (e.g. ${isBar ? "Crate → Bottle" : "Box → Piece"})`
                                 : "Add Another Packaging Type"
                               }
                             </Button>
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </div>

                     {/* Section 4: Stock Levels */}
                     {formData.type === "PRODUCT" && (
                       <div className="space-y-4">
                         <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                           <Layers className="h-4 w-4 text-slate-400" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Levels</span>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                               In-Stock Volume {formData.packagingUnits.length > 0 ? `(in ${formData.packagingUnits[0].sellingUnitName || formData.baseUnit}s)` : `(in ${formData.baseUnit}s)`}
                             </Label>
                             <div className="flex items-center gap-2">
                                <Button
                                   type="button"
                                   variant="outline"
                                   className="h-12 w-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                                   onClick={() => setFormData({ ...formData, stockQuantity: Math.max(0, parseInt(formData.stockQuantity || "0") - 1).toString() })}
                                >
                                   <Minus size={20} />
                                </Button>
                                <Input
                                  type="number"
                                  value={formData.stockQuantity}
                                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                  placeholder="0"
                                  className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-black text-center text-slate-900 dark:text-slate-100"
                                  required
                                />
                                <Button
                                   type="button"
                                   variant="outline"
                                   className="h-12 w-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                                   onClick={() => setFormData({ ...formData, stockQuantity: (parseInt(formData.stockQuantity || "0") + 1).toString() })}
                                >
                                   <Plus size={20} />
                                </Button>
                             </div>
                           </div>
                           <div className="space-y-2">
                             <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                               Min Stock Alert {formData.packagingUnits.length > 0 ? `(in ${formData.packagingUnits[0].sellingUnitName || formData.baseUnit}s)` : `(in ${formData.baseUnit}s)`}
                             </Label>
                             <Input
                               type="number"
                               value={formData.minStockLevel}
                               onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                               placeholder="10"
                               className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-black text-slate-900 dark:text-slate-100"
                             />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                               Max Stock (Overstock Alert)
                             </Label>
                             <Input
                               type="number"
                               value={formData.maxStockLevel}
                               onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value })}
                               placeholder="Optional (e.g. 100)"
                               className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-black text-slate-900 dark:text-slate-100"
                             />
                           </div>
                         </div>
                       </div>
                     )}

                     {/* Pharmacy-specific fields */}
                     {isPharmacy && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</Label>
                           <Input
                             type="date"
                             value={formData.expiryDate}
                             onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                             className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-bold text-slate-900 dark:text-slate-100"
                           />
                         </div>
                         <div className="space-y-2">
                           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch ID</Label>
                           <Input
                             value={formData.batchNumber}
                             onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                             placeholder="B-00000"
                             className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-mono text-xs text-slate-900 dark:text-slate-100"
                           />
                         </div>
                         
                         <div className="space-y-2 col-span-1 sm:col-span-2">
                           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generic Alternative</Label>
                           <Input
                             value={formData.genericAlternative || ""}
                             onChange={(e) => setFormData({ ...formData, genericAlternative: e.target.value })}
                             placeholder="e.g. Paracetamol 500mg"
                             className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-bold text-slate-900 dark:text-slate-100"
                           />
                         </div>
                         
                         <div className="flex items-center space-x-2 mt-2">
                           <input
                             type="checkbox"
                             id="requiresPrescription"
                             checked={formData.requiresPrescription || false}
                             onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                             className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                           />
                           <Label htmlFor="requiresPrescription" className="text-xs font-bold text-slate-600 dark:text-slate-300">Requires Prescription</Label>
                         </div>
                         
                         <div className="flex items-center space-x-2 mt-2">
                           <input
                             type="checkbox"
                             id="isControlledSubstance"
                             checked={formData.isControlledSubstance || false}
                             onChange={(e) => setFormData({ ...formData, isControlledSubstance: e.target.checked })}
                             className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                           />
                           <Label htmlFor="isControlledSubstance" className="text-xs font-bold text-slate-600 dark:text-slate-300">Controlled Substance</Label>
                         </div>
                       </div>
                     )}
                   </div>
                     {/* Favorite Toggle */}
                     <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-3">
                         <input
                           type="checkbox"
                           id="isFavorite"
                           checked={formData.isFavorite || false}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isFavorite: e.target.checked })}
                           className="h-5 w-5 rounded border-slate-200 text-amber-500 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-900"
                         />
                         <Label htmlFor="isFavorite" className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                           <Star className={cn("h-4 w-4", formData.isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-400")} />
                           Mark as Favorite Product
                         </Label>
                       </div>
                     </div>
                 </div>
                 <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 sm:p-8 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
                   <Button
                     type="button"
                     variant="ghost"
                     className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 order-2 sm:order-1"
                     onClick={() => setIsDialogOpen(false)}
                   >
                     Cancel
                   </Button>
                   <Button
                     type="submit"
                     className="h-12 px-10 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl active:scale-95 transition-all order-1 sm:order-2"
                   >
                     {editingProduct ? "Save Changes" : "Add Product"}
                   </Button>
                 </div>
               </form>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl sm:rounded-[2rem]">
        <div className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
             <Input
                placeholder="Filter by product name, SKU..."
                className="pl-12 h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:bg-white font-bold text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <div className="flex gap-2 shrink-0">
             <DropdownMenu>
               <DropdownMenuTrigger render={
                 <Button variant="ghost" className={cn("rounded-2xl gap-2 font-black uppercase text-[10px] tracking-widest h-12 px-6 transition-all hover:bg-white dark:hover:bg-slate-800", (filterCategory !== "all" || filterStock !== "all" || filterType !== "all") ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900" : "text-slate-400 hover:text-primary")}>
                    <Filter className="h-4 w-4" />
                    {(filterCategory !== "all" || filterStock !== "all" || filterType !== "all") ? `Filter (${(filterCategory !== "all" ? 1 : 0) + (filterStock !== "all" ? 1 : 0) + (filterType !== "all" ? 1 : 0)})` : "Filter"}
                 </Button>
               } />
               <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100 dark:border-slate-800">
                 <DropdownMenuGroup>
                   <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 p-2">Stock Level</DropdownMenuLabel>
                   <DropdownMenuItem onClick={() => setFilterStock("all")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", filterStock === "all" && "bg-slate-100 dark:bg-slate-800")}>
                     All Stock Levels
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setFilterStock("in")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", filterStock === "in" && "bg-slate-100 dark:bg-slate-800")}>
                     In Stock
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setFilterStock("low")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", filterStock === "low" && "bg-slate-100 dark:bg-slate-800")}>
                     Low Stock
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setFilterStock("out")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", filterStock === "out" && "bg-slate-100 dark:bg-slate-800")}>
                     Out of Stock
                   </DropdownMenuItem>
                 </DropdownMenuGroup>
                 
                 <DropdownMenuSeparator className="my-1" />
                 
                 <DropdownMenuGroup>
                   <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 p-2">Category</DropdownMenuLabel>
                   <DropdownMenuItem onClick={() => setFilterCategory("all")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", filterCategory === "all" && "bg-slate-100 dark:bg-slate-800")}>
                     All Categories
                   </DropdownMenuItem>
                   {categories.map((c) => (
                     <DropdownMenuItem key={c.id} onClick={() => setFilterCategory(c.id)} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", filterCategory === c.id && "bg-slate-100 dark:bg-slate-800")}>
                       {c.name}
                     </DropdownMenuItem>
                   ))}
                 </DropdownMenuGroup>
                 
                 <DropdownMenuSeparator className="my-1" />
                 
                 <DropdownMenuGroup>
                   <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 p-2">Type</DropdownMenuLabel>
                   <DropdownMenuItem onClick={() => setFilterType("all")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", filterType === "all" && "bg-slate-100 dark:bg-slate-800")}>
                     All Types
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setFilterType("PRODUCT")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", filterType === "PRODUCT" && "bg-slate-100 dark:bg-slate-800")}>
                     Products Only
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setFilterType("SERVICE")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", filterType === "SERVICE" && "bg-slate-100 dark:bg-slate-800")}>
                     Services Only
                   </DropdownMenuItem>
                 </DropdownMenuGroup>
               </DropdownMenuContent>
             </DropdownMenu>

             <DropdownMenu>
               <DropdownMenuTrigger render={
                 <Button variant="ghost" className={cn("rounded-2xl gap-2 font-black uppercase text-[10px] tracking-widest h-12 px-6 transition-all hover:bg-white dark:hover:bg-slate-800", sortBy !== "name_asc" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900" : "text-slate-400 hover:text-primary")}>
                    <ArrowUpDown className="h-4 w-4" />
                    {sortBy === "name_asc" && "Sort (A-Z)"}
                    {sortBy === "name_desc" && "Sort (Z-A)"}
                    {sortBy === "price_asc" && "Price (Asc)"}
                    {sortBy === "price_desc" && "Price (Desc)"}
                    {sortBy === "stock_asc" && "Stock (Asc)"}
                    {sortBy === "stock_desc" && "Stock (Desc)"}
                 </Button>
               } />
               <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100 dark:border-slate-800">
                 <DropdownMenuGroup>
                   <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 p-2">Sort By</DropdownMenuLabel>
                   <DropdownMenuItem onClick={() => setSortBy("name_asc")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", sortBy === "name_asc" && "bg-slate-100 dark:bg-slate-800")}>
                     Name (A - Z)
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setSortBy("name_desc")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", sortBy === "name_desc" && "bg-slate-100 dark:bg-slate-800")}>
                     Name (Z - A)
                   </DropdownMenuItem>
                   <DropdownMenuSeparator className="my-1" />
                   <DropdownMenuItem onClick={() => setSortBy("price_asc")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", sortBy === "price_asc" && "bg-slate-100 dark:bg-slate-800")}>
                     Price (Low to High)
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setSortBy("price_desc")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", sortBy === "price_desc" && "bg-slate-100 dark:bg-slate-800")}>
                     Price (High to Low)
                   </DropdownMenuItem>
                   <DropdownMenuSeparator className="my-1" />
                   <DropdownMenuItem onClick={() => setSortBy("stock_asc")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", sortBy === "stock_asc" && "bg-slate-100 dark:bg-slate-800")}>
                     Stock (Low to High)
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setSortBy("stock_desc")} className={cn("rounded-xl p-2.5 font-bold text-xs cursor-pointer", sortBy === "stock_desc" && "bg-slate-100 dark:bg-slate-800")}>
                     Stock (High to Low)
                   </DropdownMenuItem>
                 </DropdownMenuGroup>
               </DropdownMenuContent>
             </DropdownMenu>
           </div>
        </div>
      </Card>

      <ResponsiveTable
        data={filteredProducts}
        columns={columns}
        loading={loading}
        onRowClick={isAdmin ? handleEdit : undefined}
        emptyState={
          <EmptyState
            icon={Package}
            title="No Products Found"
            description="Your inventory is empty. Add your first product to begin tracking."
            actionLabel="Add Product"
            onAction={() => setIsDialogOpen(true)}
          />
        }
        actions={isAdmin ? ((product) => (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <MoreVertical className="h-5 w-5 text-slate-400" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100 dark:border-slate-800">
              <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-800 mb-2">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Actions</p>
              </div>
              <DropdownMenuItem onClick={() => handleEdit(product)} className="font-black text-[10px] uppercase tracking-widest gap-3 rounded-xl">
                <Pencil className="h-4 w-4 text-slate-400" /> Edit Product
              </DropdownMenuItem>
              <div className="h-px bg-slate-50 dark:bg-slate-800 my-2" />
              <DropdownMenuItem
                className="text-rose-600 font-black text-[10px] uppercase tracking-widest gap-3 focus:bg-rose-50 focus:text-rose-700 rounded-xl"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleDelete(product.id);
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )) : undefined}
      />
    </div>
  );
}
