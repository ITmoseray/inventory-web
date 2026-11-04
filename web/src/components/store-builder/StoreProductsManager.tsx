"use client";

import React, { useState, useRef } from "react";
import { 
  Search, Eye, EyeOff, Star, Tag, DollarSign, Check, X, Filter, 
  ShoppingBag, ArrowUpDown, RefreshCw, ExternalLink, Wand2,
  Copy, CheckCheck, FileText, ChevronRight, Plus, Trash2, Edit3, Upload,
  Image as ImageIcon, Layers, AlertCircle, FileSpreadsheet, Download, UploadCloud
} from "lucide-react";
import { 
  updateStoreProductLink, 
  generateProductAICopyAction,
  addStandaloneProductAction,
  updateStandaloneProductAction,
  deleteStandaloneProductAction,
  bulkAddStandaloneProductsAction
} from "@/lib/actions/store-builder";
import { uploadProductImage } from "@/lib/actions/upload";
import { AIProductCopyOutput } from "@/types/store-builder";
import { toast } from "sonner";
import Link from "next/link";

interface ProductItem {
  id: string;
  storeProductId?: string;
  name: string;
  sku?: string | null;
  unitPrice: number;
  salePrice?: number | null;
  stockQuantity: number;
  imageUrl?: string | null;
  images?: string[];
  category: string;
  status: string;
  isListedOnline: boolean;
  isFeatured: boolean;
  customBadge?: string | null;
  customPrice?: number | null;
  displayOrder: number;
  isStandalone?: boolean;
  description?: string | null;
}

interface Props {
  initialProducts: ProductItem[];
  currency?: string;
  storeSlug?: string;
  isStandalone?: boolean;
}

export function StoreProductsManager({ initialProducts = [], currency = "SLE", storeSlug, isStandalone = false }: Props) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [filterMode, setFilterMode] = useState<"ALL" | "ONLINE" | "FEATURED" | "HIDDEN">("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Standalone Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingNewProduct, setIsSubmittingNewProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isGeneratingNewProductAi, setIsGeneratingNewProductAi] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "General",
    price: "",
    salePrice: "",
    stockQuantity: "10",
    description: "",
    sku: "",
    imageUrl: "",
    customBadge: "",
    isFeatured: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk Add & Spreadsheet Import State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkImportTab, setBulkImportTab] = useState<"file" | "paste">("file");
  const [bulkInputText, setBulkInputText] = useState("");
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [importedRows, setImportedRows] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [importValidationErrors, setImportValidationErrors] = useState<string[]>([]);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  // Edit badge / custom price modal
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [badgeInput, setBadgeInput] = useState("");
  const [customPriceInput, setCustomPriceInput] = useState("");
  const [editNameInput, setEditNameInput] = useState("");
  const [editCategoryInput, setEditCategoryInput] = useState("");
  const [editStockInput, setEditStockInput] = useState("");
  const [editSalePriceInput, setEditSalePriceInput] = useState("");

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
      if (product.isStandalone) {
        await updateStandaloneProductAction(product.id, {
          isVisible: newStatus,
          isFeatured: newStatus ? product.isFeatured : false
        });
      } else {
        await updateStoreProductLink(product.id, {
          isVisible: newStatus,
          isFeatured: newStatus ? product.isFeatured : false,
          customBadge: product.customBadge,
          customPrice: product.customPrice
        });
      }
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
      if (product.isStandalone) {
        await updateStandaloneProductAction(product.id, {
          isVisible: true,
          isFeatured: newFeatured
        });
      } else {
        await updateStoreProductLink(product.id, {
          isVisible: true,
          isFeatured: newFeatured,
          customBadge: product.customBadge,
          customPrice: product.customPrice
        });
      }
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: newFeatured } : p));
      toast.success(newFeatured ? `"${product.name}" spotlighted as Featured!` : `"${product.name}" removed from Featured`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update featured state");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteStandaloneProduct = async (product: ProductItem) => {
    if (!confirm(`Are you sure you want to remove "${product.name}" from your store?`)) return;
    setLoadingId(product.id);
    try {
      await deleteStandaloneProductAction(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      toast.success(`"${product.name}" deleted from store catalog`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setBadgeInput(p.customBadge || "");
    setCustomPriceInput(p.customPrice ? String(p.customPrice) : p.unitPrice ? String(p.unitPrice) : "");
    setEditNameInput(p.name || "");
    setEditCategoryInput(p.category || "");
    setEditStockInput(p.stockQuantity != null ? String(p.stockQuantity) : "");
    setEditSalePriceInput(p.salePrice ? String(p.salePrice) : "");
  };

  const handleSaveCustomDetails = async () => {
    if (!editingProduct) return;
    setLoadingId(editingProduct.id);
    try {
      const parsedPrice = customPriceInput.trim() ? parseFloat(customPriceInput.trim()) : null;
      const cleanBadge = badgeInput.trim() ? badgeInput.trim().toUpperCase() : null;
      const parsedSalePrice = editSalePriceInput.trim() ? parseFloat(editSalePriceInput.trim()) : null;
      const parsedStock = editStockInput.trim() ? parseInt(editStockInput.trim()) : undefined;

      if (editingProduct.isStandalone) {
        const updateRes = await updateStandaloneProductAction(editingProduct.id, {
          name: editNameInput.trim() || editingProduct.name,
          category: editCategoryInput.trim() || editingProduct.category,
          price: parsedPrice !== null ? parsedPrice : editingProduct.unitPrice,
          salePrice: parsedSalePrice,
          stockQuantity: parsedStock,
          customBadge: cleanBadge
        });

        if (updateRes.success && updateRes.product) {
          const sp = updateRes.product;
          setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
            ...p,
            name: sp.name,
            category: sp.category,
            unitPrice: Number(sp.price),
            salePrice: sp.salePrice ? Number(sp.salePrice) : null,
            stockQuantity: sp.stockQuantity != null ? Number(sp.stockQuantity) : p.stockQuantity,
            customBadge: sp.customBadge,
            customPrice: Number(sp.price)
          } : p));
        }
      } else {
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
      }

      toast.success("Product settings saved!");
      setEditingProduct(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save product details");
    } finally {
      setLoadingId(null);
    }
  };

  // Image Upload handler for Add Product Modal
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadProductImage(formData);
      if (res.success && res.url) {
        setNewProduct(prev => ({ ...prev, imageUrl: res.url }));
        toast.success("Image uploaded!");
      } else {
        toast.error(res.error || "Failed to upload image");
      }
    } catch (err: any) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // AI Copy generation for New Product Modal
  const handleNewProductAiCopy = async () => {
    if (!newProduct.name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }
    setIsGeneratingNewProductAi(true);
    try {
      const res = await generateProductAICopyAction({
        name: newProduct.name,
        category: newProduct.category,
        price: parseFloat(newProduct.price) || 0,
        notes: newProduct.description
      });
      if (res.success && res.copy) {
        setNewProduct(prev => ({
          ...prev,
          description: res.copy?.fullDescription || res.copy?.shortDescription || prev.description,
          customBadge: res.copy?.badge || prev.customBadge || "HOT"
        }));
        toast.success("AI description & promotional badge generated!");
      }
    } catch (err: any) {
      toast.error(err.message || "AI copy generation error");
    } finally {
      setIsGeneratingNewProductAi(false);
    }
  };

  // Create Standalone Product Submit
  const handleCreateStandaloneProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    const parsedPrice = parseFloat(newProduct.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSubmittingNewProduct(true);
    try {
      const res = await addStandaloneProductAction({
        name: newProduct.name.trim(),
        price: parsedPrice,
        salePrice: newProduct.salePrice ? parseFloat(newProduct.salePrice) : undefined,
        category: newProduct.category.trim() || "General",
        stockQuantity: newProduct.stockQuantity ? parseInt(newProduct.stockQuantity) : 99,
        description: newProduct.description.trim() || undefined,
        sku: newProduct.sku.trim() || undefined,
        images: newProduct.imageUrl.trim() ? [newProduct.imageUrl.trim()] : [],
        customBadge: newProduct.customBadge.trim() || undefined,
        isFeatured: newProduct.isFeatured
      });

      if (res.success && res.product) {
        const sp = res.product;
        const createdItem: ProductItem = {
          id: sp.id,
          name: sp.name,
          sku: sp.sku,
          unitPrice: Number(sp.price),
          salePrice: sp.salePrice ? Number(sp.salePrice) : null,
          stockQuantity: sp.stockQuantity != null ? Number(sp.stockQuantity) : 99,
          imageUrl: sp.images && sp.images.length > 0 ? sp.images[0] : null,
          images: sp.images || [],
          category: sp.category || "General",
          status: "active",
          isListedOnline: true,
          isFeatured: !!sp.isFeatured,
          customBadge: sp.customBadge || null,
          customPrice: Number(sp.price),
          displayOrder: sp.displayOrder || 0,
          isStandalone: true,
          description: sp.description
        };
        setProducts(prev => [createdItem, ...prev]);
        toast.success(`🎉 Product "${createdItem.name}" added to online store!`);
        setIsAddModalOpen(false);
        setNewProduct({
          name: "",
          category: "General",
          price: "",
          salePrice: "",
          stockQuantity: "10",
          description: "",
          sku: "",
          imageUrl: "",
          customBadge: "",
          isFeatured: false
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add product");
    } finally {
      setIsSubmittingNewProduct(false);
    }
  };

  // Downloadable CSV template for products
  const handleDownloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Price,SalePrice,Category,Stock,SKU,Description,ImageUrl\n" +
      "Summer Floral Maxi Dress,450,399,Women's Fashion,15,DRS-001,Handcrafted summer dress with breathable cotton,https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800\n" +
      "Wireless Noise Cancelling Earbuds,850,750,Phones & Tech,25,EAR-102,Crisp sound with 24hr battery life,https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800\n" +
      "Organic Sierra Leone Palm Oil 5L,180,,Fresh Grocery,30,OIL-505,Freshly pressed natural farm palm oil,\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "protech_product_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded CSV template!");
  };

  // Spreadsheet file upload handler (CSV + Excel)
  const handleSpreadsheetFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith(".csv")) {
        const text = await file.text();
        parseCsvText(text);
      } else {
        const XLSX = await import("xlsx");
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

        const mapped = jsonData.map((row: any) => ({
          name: row.Name || row.name || row["Product Name"] || row["PRODUCT NAME"] || "",
          price: parseFloat(row.Price || row.price || row.SellingPrice || row["Unit Price"] || 0),
          salePrice: row.SalePrice || row.salePrice || row["Sale Price"] ? parseFloat(row.SalePrice || row.salePrice || row["Sale Price"]) : undefined,
          category: row.Category || row.category || "General",
          stockQuantity: parseInt(row.Stock || row.stock || row.Quantity || row["Stock Quantity"] || 20),
          sku: row.SKU || row.sku || undefined,
          description: row.Description || row.description || undefined,
          imageUrl: row.ImageUrl || row.imageUrl || row.Image || undefined,
        }));

        validateAndSetImport(mapped);
      }
    } catch (err: any) {
      toast.error("Failed to read spreadsheet file: " + (err.message || "Invalid format"));
    }
  };

  const parseCsvText = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      toast.error("CSV file must have a header row and at least one product row");
      return;
    }

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/["']/g, ""));
    const nameIdx = headers.findIndex(h => h.includes("name"));
    const priceIdx = headers.findIndex(h => h.includes("price") && !h.includes("sale"));
    const salePriceIdx = headers.findIndex(h => h.includes("sale") || h.includes("discount"));
    const catIdx = headers.findIndex(h => h.includes("cat"));
    const stockIdx = headers.findIndex(h => h.includes("stock") || h.includes("qty") || h.includes("quantity"));
    const skuIdx = headers.findIndex(h => h.includes("sku"));
    const descIdx = headers.findIndex(h => h.includes("desc"));
    const imgIdx = headers.findIndex(h => h.includes("img") || h.includes("image"));

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
      if (parts.length === 0 || parts.every(p => !p)) continue;

      const name = nameIdx !== -1 ? parts[nameIdx] : parts[0];
      const price = priceIdx !== -1 ? parseFloat(parts[priceIdx]) : parseFloat(parts[1]) || 0;
      const salePrice = salePriceIdx !== -1 && parts[salePriceIdx] ? parseFloat(parts[salePriceIdx]) : undefined;
      const category = catIdx !== -1 && parts[catIdx] ? parts[catIdx] : (parts[2] || "General");
      const stockQuantity = stockIdx !== -1 && parts[stockIdx] ? parseInt(parts[stockIdx]) : (parseInt(parts[3]) || 20);
      const sku = skuIdx !== -1 && parts[skuIdx] ? parts[skuIdx] : undefined;
      const description = descIdx !== -1 && parts[descIdx] ? parts[descIdx] : undefined;
      const imageUrl = imgIdx !== -1 && parts[imgIdx] ? parts[imgIdx] : undefined;

      rows.push({ name, price, salePrice, category, stockQuantity, sku, description, imageUrl });
    }

    validateAndSetImport(rows);
  };

  const validateAndSetImport = (rows: any[]) => {
    const errs: string[] = [];
    let validCount = 0;

    rows.forEach((r, idx) => {
      if (!r.name || r.name.trim().length === 0) {
        errs.push(`Row ${idx + 1}: Missing product name`);
      } else if (isNaN(r.price) || r.price < 0) {
        errs.push(`Row ${idx + 1} ("${r.name}"): Invalid price`);
      } else {
        validCount++;
      }
    });

    setImportedRows(rows);
    setImportValidationErrors(errs);
    setImportSummary({
      total: rows.length,
      valid: validCount,
      invalid: errs.length
    });

    if (validCount > 0) {
      toast.success(`Parsed ${rows.length} rows (${validCount} valid)!`);
    } else {
      toast.error("No valid product rows found in file.");
    }
  };

  // Bulk Add Products Submit (supports both uploaded spreadsheet rows & quick text paste)
  const handleBulkAddProducts = async (e: React.FormEvent) => {
    e.preventDefault();

    let itemsToImport: any[] = [];

    if (bulkImportTab === "file") {
      itemsToImport = importedRows.filter(r => r.name && !isNaN(r.price) && r.price >= 0);
      if (itemsToImport.length === 0) {
        toast.error("Please upload a spreadsheet with at least one valid product");
        return;
      }
    } else {
      if (!bulkInputText.trim()) {
        toast.error("Please enter at least one product row");
        return;
      }

      const lines = bulkInputText.split("\n").filter(l => l.trim().length > 0);
      itemsToImport = lines.map(line => {
        const parts = line.split(",").map(p => p.trim());
        const name = parts[0] || "Item";
        const price = parseFloat(parts[1]) || 0;
        const category = parts[2] || "General";
        const stockQuantity = parseInt(parts[3]) || 20;
        return { name, price, category, stockQuantity };
      });
    }

    if (itemsToImport.length === 0) {
      toast.error("No valid products detected for import");
      return;
    }

    setIsSubmittingBulk(true);
    try {
      const res = await bulkAddStandaloneProductsAction(itemsToImport);
      if (res.success) {
        let msg = `🎉 Added ${res.count} products to your storefront!`;
        if (res.skippedDuplicates && res.skippedDuplicates > 0) {
          msg += ` (${res.skippedDuplicates} duplicates skipped)`;
        }
        toast.success(msg);
        setIsBulkModalOpen(false);
        setBulkInputText("");
        setImportedRows([]);
        setImportSummary(null);
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to import products");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk add products");
    } finally {
      setIsSubmittingBulk(false);
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
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:brightness-110 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-muted border border-border hover:bg-muted/80 text-foreground transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Add</span>
          </button>

          {storeSlug && (
            <Link
              href={`/store/${storeSlug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors w-fit"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Storefront
            </Link>
          )}
        </div>
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
                      {p.salePrice ? (
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {currency} {p.salePrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-muted-foreground line-through">
                            {currency} {p.unitPrice.toLocaleString()}
                          </span>
                        </div>
                      ) : p.customPrice ? (
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

                    {/* Actions: AI Copy + Customize / Edit + Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAiCopy(p)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-1 transition-colors"
                          title="Generate AI Copy & SEO"
                        >
                          
                          <span>AI Copy</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border hover:bg-muted transition-colors flex items-center gap-1"
                          title={p.isStandalone ? "Edit Product" : "Customize Online Settings"}
                        >
                          {p.isStandalone && <Edit3 className="w-3 h-3 text-muted-foreground" />}
                          <span>{p.isStandalone ? "Edit" : "Customize"}</span>
                        </button>
                        {p.isStandalone && (
                          <button
                            onClick={() => handleDeleteStandaloneProduct(p)}
                            disabled={loadingId === p.id}
                            className="p-1.5 text-xs font-medium rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                            title="Delete product from catalog"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ── CUSTOMIZE OVERRIDES / EDIT MODAL ─────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base text-foreground">
                {editingProduct.isStandalone ? "Edit Standalone Product" : "Online Product Settings"}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {editingProduct.isStandalone ? (
              /* Full Standalone Product Editor */
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={editNameInput}
                    onChange={(e) => setEditNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Product name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Regular Price ({currency})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={customPriceInput}
                      onChange={(e) => setCustomPriceInput(e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Sale Price (Optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editSalePriceInput}
                      onChange={(e) => setEditSalePriceInput(e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Discounted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editCategoryInput}
                      onChange={(e) => setEditCategoryInput(e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={editStockInput}
                      onChange={(e) => setEditStockInput(e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Promotional Badge (e.g. SALE, HOT, NEW, 20% OFF)
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
            ) : (
              /* Enterprise Product Override Settings */
              <div className="space-y-3 pt-1">
                <div>
                  <p className="text-sm font-semibold text-foreground">{editingProduct.name}</p>
                  <p className="text-xs text-muted-foreground">Standard Inventory Price: {currency} {editingProduct.unitPrice.toLocaleString()}</p>
                </div>

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
            )}

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
                {loadingId === editingProduct.id ? "Saving..." : "Save Changes"}
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

      {/* ── ADD STANDALONE PRODUCT MODAL ───────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Add New Store Product</h3>
                  <p className="text-xs text-muted-foreground">Add an item to your online storefront with custom pricing & photos.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStandaloneProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Cotton Polo Shirt"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Regular Price ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 250"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Sale / Discount Price ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional (e.g. 200)"
                    value={newProduct.salePrice}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, salePrice: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fashion, Tech, Groceries"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    value={newProduct.stockQuantity}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Image Input & Cloudinary Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  Product Image
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or upload"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-background border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-3 py-2 text-xs font-bold rounded-xl border bg-muted hover:bg-muted/80 flex items-center gap-1.5 shrink-0"
                  >
                    {isUploadingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploadingImage ? "Uploading..." : "Upload"}</span>
                  </button>
                </div>
                {newProduct.imageUrl && (
                  <div className="w-14 h-14 rounded-xl border overflow-hidden bg-muted mt-1">
                    <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Description with AI Assistant */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    Description
                  </label>
                  <button
                    type="button"
                    onClick={handleNewProductAiCopy}
                    disabled={isGeneratingNewProductAi}
                    className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                  >
                    
                    <span>{isGeneratingNewProductAi ? "Generating..." : "✨ AI Copywriter"}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Compelling description highlighting key materials, sizing, and benefits..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                />
              </div>

              {/* Badge & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Promotional Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NEW, SALE, HOT"
                    value={newProduct.customBadge}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, customBadge: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {["NEW", "SALE", "HOT", "BESTSELLER"].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setNewProduct(prev => ({ ...prev, customBadge: preset }))}
                        className="px-2 py-0.5 rounded text-[10px] font-bold border bg-muted/60 hover:bg-muted text-muted-foreground"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="newIsFeatured"
                    checked={newProduct.isFeatured}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="newIsFeatured" className="text-xs font-semibold text-foreground cursor-pointer">
                    Feature on Store Homepage
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewProduct}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:brightness-110 shadow-sm disabled:opacity-50"
                >
                  {isSubmittingNewProduct ? "Adding Product..." : "Add to Storefront"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BULK & SPREADSHEET IMPORT MODAL ────────────────── */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-card border rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Import Product Spreadsheet</h3>
                  <p className="text-xs text-muted-foreground">Import items via CSV or Excel with column mapping & duplicate protection.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setImportedRows([]);
                  setImportSummary(null);
                  setImportValidationErrors([]);
                }}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-xl">
              <button
                type="button"
                onClick={() => setBulkImportTab("file")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  bulkImportTab === "file" 
                    ? "bg-card text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload File (.csv, .xlsx)
              </button>
              <button
                type="button"
                onClick={() => setBulkImportTab("paste")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  bulkImportTab === "paste" 
                    ? "bg-card text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Quick Text Paste
              </button>
            </div>

            <form onSubmit={handleBulkAddProducts} className="space-y-4">
              {bulkImportTab === "file" ? (
                <div className="space-y-4">
                  {/* Download Template Banner */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-indigo-500">Need the standard spreadsheet format?</p>
                      <p className="text-[11px] text-muted-foreground">Download our pre-formatted CSV template with sample data.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadCsvTemplate}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Template
                    </button>
                  </div>

                  {/* Hidden File Input & Drop Area */}
                  <input
                    ref={excelFileInputRef}
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleSpreadsheetFileChange}
                    className="hidden"
                  />

                  <div
                    onClick={() => excelFileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-border hover:border-primary/60 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all text-center cursor-pointer space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Click to upload product spreadsheet</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Supports .CSV, .XLSX, and .XLS up to 10MB</p>
                    </div>
                  </div>

                  {/* Summary & Preview Table if parsed */}
                  {importSummary && (
                    <div className="space-y-3 p-3.5 rounded-2xl bg-muted/40 border text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span>Import Preview:</span>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-emerald-500">✓ {importSummary.valid} valid</span>
                          {importSummary.invalid > 0 && (
                            <span className="text-rose-500">✕ {importSummary.invalid} invalid</span>
                          )}
                          <span className="text-muted-foreground">({importSummary.total} total)</span>
                        </div>
                      </div>

                      {importValidationErrors.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] space-y-1 max-h-24 overflow-y-auto">
                          <p className="font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Validation Warnings:
                          </p>
                          {importValidationErrors.slice(0, 5).map((err, i) => (
                            <p key={i}>• {err}</p>
                          ))}
                          {importValidationErrors.length > 5 && (
                            <p>...and {importValidationErrors.length - 5} more</p>
                          )}
                        </div>
                      )}

                      {/* Top 4 Rows Preview */}
                      <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-muted text-muted-foreground font-bold">
                            <tr>
                              <th className="p-2">Name</th>
                              <th className="p-2">Price</th>
                              <th className="p-2">Category</th>
                              <th className="p-2">Stock</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {importedRows.slice(0, 4).map((row, idx) => (
                              <tr key={idx} className="hover:bg-muted/30">
                                <td className="p-2 font-medium truncate max-w-[140px]">{row.name}</td>
                                <td className="p-2 font-bold text-primary">{currency} {row.price}</td>
                                <td className="p-2">{row.category}</td>
                                <td className="p-2">{row.stockQuantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-muted/40 border text-xs text-muted-foreground space-y-1">
                    <p className="font-bold text-foreground">Format per line:</p>
                    <p className="font-mono text-[11px]">Product Name, Price, Category, Stock</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Example:</p>
                    <p className="font-mono text-[11px] text-primary">Summer Floral Dress, 450, Fashion, 15</p>
                    <p className="font-mono text-[11px] text-primary">Leather Oxford Shoes, 850, Footwear, 8</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Product Lines
                    </label>
                    <textarea
                      rows={6}
                      placeholder={`Men's Casual Shirt, 350, Fashion, 20\nClassic Leather Belt, 150, Accessories, 15\nWireless Bluetooth Earbuds, 450, Electronics, 10`}
                      value={bulkInputText}
                      onChange={(e) => setBulkInputText(e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-[11px] text-muted-foreground">
                  <span className="text-emerald-500 font-bold">✓</span> Automatic duplicate detection enabled
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBulkModalOpen(false);
                      setImportedRows([]);
                      setImportSummary(null);
                      setImportValidationErrors([]);
                    }}
                    className="px-4 py-2 text-xs font-medium rounded-xl border hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBulk || (bulkImportTab === "file" && importedRows.length === 0)}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:brightness-110 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingBulk ? "Importing..." : "Confirm & Import Products"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
