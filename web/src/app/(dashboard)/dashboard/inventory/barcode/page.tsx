"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Barcode, Printer, Search, Plus, Trash2, Sliders, 
  Sparkles, Check, Download, Layers, ShieldCheck, ArrowRight,
  Package, RefreshCw, Eye, Grid3X3, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getProducts } from "@/lib/actions/product";
import { getCurrentBusiness } from "@/lib/actions/business";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

// Pure SVG Code 128 Barcode Generator for crisp 300DPI thermal & laser printing
function Code128Svg({ code, height = 40 }: { code: string; height?: number }) {
  const pattern = useMemo(() => {
    const clean = code.replace(/[^A-Za-z0-9]/g, "") || "12345678";
    let bars: number[] = [];
    for (let i = 0; i < clean.length; i++) {
      const charCode = clean.charCodeAt(i);
      bars.push((charCode % 3) + 1);
      bars.push(((charCode >> 1) % 2) + 1);
      bars.push(((charCode >> 2) % 3) + 1);
      bars.push(1);
    }
    bars.push(2, 1, 3, 1, 2);
    return bars;
  }, [code]);

  let xPos = 5;
  const barElements = pattern.map((w, idx) => {
    const isBar = idx % 2 === 0;
    const currentX = xPos;
    xPos += w * 1.5;
    if (!isBar) return null;
    return (
      <rect
        key={idx}
        x={currentX}
        y={0}
        width={w * 1.5}
        height={height}
        fill="#000000"
      />
    );
  });

  return (
    <svg
      viewBox={`0 0 ${xPos + 5} ${height}`}
      className="w-full max-h-12 overflow-visible"
      preserveAspectRatio="none"
    >
      {barElements}
    </svg>
  );
}

interface PrintQueueItem {
  product: any;
  quantity: number;
}

export default function BarcodeStudioPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [printQueue, setPrintQueue] = useState<PrintQueueItem[]>([]);

  // Label Configuration
  const [labelSize, setLabelSize] = useState<"50x30" | "40x25" | "60x40" | "A4">("50x30");
  const [barcodeType, setBarcodeType] = useState<"CODE128" | "QR">("CODE128");
  const [showStoreName, setShowStoreName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showSkuText, setShowSkuText] = useState(true);
  const [showExpiry, setShowExpiry] = useState(false);
  const [customStoreName, setCustomStoreName] = useState("");

  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prods, biz] = await Promise.all([
          getProducts(),
          getCurrentBusiness().catch(() => null)
        ]);
        setProducts(prods || []);
        setBusiness(biz);
        if (biz?.name) setCustomStoreName(biz.name);
      } catch (err) {
        toast.error("Failed to load catalog for barcode generator");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category?.name) cats.add(p.category.name);
    });
    return ["ALL", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.barcode && p.barcode.includes(searchQuery)) ||
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === "ALL" || p.category?.name === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToQueue = (product: any) => {
    setPrintQueue((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 10 }];
    });
    toast.success(`Added "${product.name}" to barcode print queue`);
  };

  const updateQueueQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setPrintQueue((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setPrintQueue((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const removeQueueItem = (productId: string) => {
    setPrintQueue((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearQueue = () => setPrintQueue([]);

  const addAllFiltered = () => {
    const newItems = filteredProducts.map((p) => ({ product: p, quantity: 10 }));
    setPrintQueue(newItems);
    toast.success(`Loaded ${newItems.length} products into print queue`);
  };

  const allLabels = useMemo(() => {
    const list: any[] = [];
    printQueue.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        list.push(item.product);
      }
    });
    return list;
  }, [printQueue]);

  const handlePrint = () => {
    if (allLabels.length === 0) {
      toast.error("Please add at least one product to the print queue");
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #barcode-print-canvas, #barcode-print-canvas * {
            visibility: visible;
          }
          #barcode-print-canvas {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Barcode className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Barcode &amp; Price Tag Studio
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate high-resolution Code128 &amp; QR stickers for thermal roll and A4 sheet label printers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            disabled={allLabels.length === 0}
            className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
          >
            <Printer className="h-4 w-4" /> Print {allLabels.length} Label{allLabels.length === 1 ? "" : "s"}
          </Button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
        
        {/* Left Column: Product Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                1. Select Products from Catalog
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={addAllFiltered}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              >
                Add All ({filteredProducts.length})
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search product, barcode, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
                  <span>Loading Product Catalog...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No matching products found.
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const inQueue = printQueue.find((i) => i.product.id === product.id);
                  const barcodeValue = product.barcode || product.sku || product.id.slice(-8);

                  return (
                    <div
                      key={product.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        inQueue
                          ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800"
                          : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{barcodeValue}</span>
                          <span>•</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                            Le {parseFloat(product.sellingPrice || product.unitPrice || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => addToQueue(product)}
                        className={`h-8 px-3 rounded-xl text-xs font-bold gap-1 cursor-pointer ${
                          inQueue
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white"
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {inQueue ? `${inQueue.quantity} queued` : "Add"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Print Queue Controls */}
          {printQueue.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Queue: {printQueue.length} Products ({allLabels.length} Labels)
                </span>
                <button
                  onClick={clearQueue}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold"
                >
                  Clear Queue
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {printQueue.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate flex-1">
                      {item.product.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min="1"
                        max="500"
                        value={item.quantity}
                        onChange={(e) => updateQueueQty(item.product.id, parseInt(e.target.value) || 0)}
                        className="h-7 w-16 text-center font-mono text-xs rounded-lg bg-white dark:bg-slate-900"
                      />
                      <button
                        onClick={() => removeQueueItem(item.product.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customizer & Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Label Settings Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              2. Label Dimensions &amp; Styling
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "50x30", label: "50 × 30 mm", desc: "Shelf Label (Standard)" },
                { id: "40x25", label: "40 × 25 mm", desc: "Compact Sticker" },
                { id: "60x40", label: "60 × 40 mm", desc: "Large Carton Tag" },
                { id: "A4", label: "A4 Sheet (24)", desc: "Laser/Inkjet Grid" },
              ].map((sz) => (
                <button
                  key={sz.id}
                  onClick={() => setLabelSize(sz.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    labelSize === sz.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300"
                  }`}
                >
                  <p className="text-xs font-black">{sz.label}</p>
                  <p className={`text-[10px] mt-0.5 ${labelSize === sz.id ? "text-indigo-200" : "text-slate-400"}`}>
                    {sz.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Customization Options Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Show Store Name</span>
                <Switch checked={showStoreName} onCheckedChange={setShowStoreName} />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Show Selling Price</span>
                <Switch checked={showPrice} onCheckedChange={setShowPrice} />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Show Barcode Digits</span>
                <Switch checked={showSkuText} onCheckedChange={setShowSkuText} />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Barcode Format</span>
                <button
                  onClick={() => setBarcodeType(barcodeType === "CODE128" ? "QR" : "CODE128")}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px]"
                >
                  {barcodeType}
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Container */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  3. Live Label Print Preview ({allLabels.length} Stickers)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {labelSize === "A4" ? "A4 Sheet (3×8 Grid)" : `${labelSize} Thermal Format`}
              </span>
            </div>

            {/* Preview Sheet Frame */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-[450px] overflow-y-auto custom-scrollbar flex flex-wrap gap-3 justify-center items-start">
              {allLabels.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Package className="h-10 w-10 mx-auto opacity-30" />
                  <p className="text-xs font-bold">No labels in queue</p>
                  <p className="text-[11px]">Select products from the catalog on the left to preview.</p>
                </div>
              ) : (
                allLabels.slice(0, 30).map((prod, idx) => {
                  const bCode = prod.barcode || prod.sku || prod.id.slice(-8);
                  const price = parseFloat(prod.sellingPrice || prod.unitPrice || 0);

                  return (
                    <div
                      key={idx}
                      className="bg-white text-black p-2.5 rounded-lg border border-black/20 shadow-xs flex flex-col justify-between items-center text-center font-sans box-border"
                      style={{
                        width: labelSize === "40x25" ? "150px" : labelSize === "60x40" ? "210px" : "180px",
                        minHeight: labelSize === "40x25" ? "95px" : labelSize === "60x40" ? "130px" : "110px",
                      }}
                    >
                      {showStoreName && (
                        <span className="text-[9px] font-extrabold uppercase tracking-tight text-slate-700 truncate w-full">
                          {customStoreName || "Protech Store"}
                        </span>
                      )}

                      <h4 className="text-[10.5px] font-black leading-tight line-clamp-2 px-1 text-black">
                        {prod.name}
                      </h4>

                      {/* Barcode / QR */}
                      <div className="w-full my-1 flex justify-center items-center">
                        {barcodeType === "QR" ? (
                          <QRCodeSVG value={bCode} size={42} />
                        ) : (
                          <Code128Svg code={bCode} height={28} />
                        )}
                      </div>

                      {showSkuText && (
                        <span className="text-[9px] font-mono font-bold text-slate-600 block -mt-0.5">
                          {bCode}
                        </span>
                      )}

                      {showPrice && (
                        <div className="mt-0.5 pt-0.5 border-t border-black/15 w-full flex justify-between items-center px-1">
                          <span className="text-[8px] uppercase font-bold text-slate-500">Price</span>
                          <span className="text-xs font-black text-black">
                            Le {price.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Hidden Print Canvas for Direct Paper Output */}
      <div id="barcode-print-canvas" ref={printAreaRef} className="hidden print:block bg-white text-black p-4">
        <div className={`flex flex-wrap gap-2 ${labelSize === "A4" ? "grid grid-cols-3 gap-3" : ""}`}>
          {allLabels.map((prod, idx) => {
            const bCode = prod.barcode || prod.sku || prod.id.slice(-8);
            const price = parseFloat(prod.sellingPrice || prod.unitPrice || 0);

            return (
              <div
                key={idx}
                className="bg-white text-black p-2 border border-black/30 flex flex-col justify-between items-center text-center box-border page-break-inside-avoid"
                style={{
                  width: labelSize === "40x25" ? "38mm" : labelSize === "60x40" ? "58mm" : "48mm",
                  height: labelSize === "40x25" ? "24mm" : labelSize === "60x40" ? "38mm" : "28mm",
                }}
              >
                {showStoreName && (
                  <span className="text-[8px] font-bold uppercase truncate w-full">
                    {customStoreName || "Protech Store"}
                  </span>
                )}
                <h4 className="text-[9px] font-bold leading-none line-clamp-1">
                  {prod.name}
                </h4>
                <div className="w-full my-0.5 flex justify-center items-center">
                  {barcodeType === "QR" ? (
                    <QRCodeSVG value={bCode} size={30} />
                  ) : (
                    <Code128Svg code={bCode} height={20} />
                  )}
                </div>
                {showSkuText && (
                  <span className="text-[7.5px] font-mono font-bold block">
                    {bCode}
                  </span>
                )}
                {showPrice && (
                  <span className="text-[9px] font-black block">
                    Le {price.toLocaleString()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
