"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Building2, ArrowRightLeft, MapPin, Package, CheckCircle2, RefreshCw, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getLocations, createLocation } from "@/lib/actions/location";
import { getStockTransfers, createStockTransfer, completeStockTransfer, cancelStockTransfer } from "@/lib/actions/transfer";
import { adjustLocationStock } from "@/lib/actions/location-stock";
import { getProducts } from "@/lib/actions/product";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function StockTransfersPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  // Location Form
  const [locName, setLocName] = useState("");
  const [locType, setLocType] = useState("STORE");
  const [locAddress, setLocAddress] = useState("");
  const [creatingLoc, setCreatingLoc] = useState(false);

  // Transfer Form
  const [fromLocId, setFromLocId] = useState("");
  const [toLocId, setToLocId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState("");
  const [creatingTransfer, setCreatingTransfer] = useState(false);

  // Search & Filter States
  const [branchSearch, setBranchSearch] = useState("");
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState("ALL");

  // Stock Adjustment Form
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [adjustLocId, setAdjustLocId] = useState("");
  const [adjustLocName, setAdjustLocName] = useState("");
  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustingStock, setAdjustingStock] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      const [locs, trans, prods] = await Promise.all([
        getLocations(),
        getStockTransfers(),
        getProducts()
      ]);
      setLocations(locs);
      setTransfers(trans);
      setProducts(prods);
    } catch (e) {
      toast.error("Failed to sync warehousing databases.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!locName) return toast.error("Location name is required.");

    try {
      setCreatingLoc(true);
      const res = await createLocation({
        name: locName,
        type: locType,
        address: locAddress || undefined,
      });

      if (res.success) {
        toast.success(`Location "${locName}" created.`);
        setIsLocationDialogOpen(false);
        setLocName("");
        setLocType("STORE");
        setLocAddress("");
        fetchInitialData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create location.");
    } finally {
      setCreatingLoc(false);
    }
  }

  async function handleCreateTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!fromLocId || !toLocId || !productId || quantity <= 0) {
      return toast.error("Please fill in all required transfer fields.");
    }
    if (fromLocId === toLocId) {
      return toast.error("Source and target locations cannot be the same.");
    }

    try {
      setCreatingTransfer(true);
      const res = await createStockTransfer({
        fromLocationId: fromLocId,
        toLocationId: toLocId,
        productId,
        quantity,
        note: note || undefined,
      });

      if (res.success) {
        toast.success("Internal transfer request registered.");
        setIsTransferDialogOpen(false);
        setFromLocId("");
        setToLocId("");
        setProductId("");
        setQuantity(0);
        setNote("");
        fetchInitialData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit transfer request.");
    } finally {
      setCreatingTransfer(false);
    }
  }

  async function handleApproveTransfer(id: string) {
    try {
      const res = await completeStockTransfer(id);
      if (res.success) {
        toast.success("Transfer completed and stock levels adjusted.");
        fetchInitialData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to approve transfer.");
    }
  }

  async function handleAdjustStock(e: React.FormEvent) {
    e.preventDefault();
    if (!adjustLocId || !adjustProductId || adjustQty < 0) {
      return toast.error("Please fill in all required fields.");
    }

    try {
      setAdjustingStock(true);
      const res = await adjustLocationStock({
        locationId: adjustLocId,
        productId: adjustProductId,
        quantity: adjustQty,
      });

      if (res.success) {
        toast.success("Stock levels manually adjusted.");
        setIsAdjustDialogOpen(false);
        setAdjustLocId("");
        setAdjustProductId("");
        setAdjustQty(0);
        fetchInitialData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to adjust stock levels.");
    } finally {
      setAdjustingStock(false);
    }
  }

  async function handleCancelTransfer(id: string) {
    try {
      const res = await cancelStockTransfer(id);
      if (res.success) {
        toast.success("Stock transfer request cancelled.");
        fetchInitialData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel transfer.");
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Warehouse <span className="text-indigo-650 dark:text-indigo-400">Transfers</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage multiple branches, warehouses, and internal logistics.</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center h-12 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest gap-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Building2 className="h-4 w-4" /> Add Branch/Warehouse
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-slate-100 bg-white dark:bg-slate-900 rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-xl font-[1000] tracking-tight uppercase text-slate-900 dark:text-white">Add Location Node</DialogTitle>
                <DialogDescription className="text-slate-500 text-xs">Create a branch or warehouse to track separate stock allocations.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLocation} className="space-y-4 mt-2">
                <div className="space-y-1">
                  <Label htmlFor="locName" className="text-[10px] font-black uppercase text-slate-405 tracking-wider">Location Name *</Label>
                  <Input id="locName" required value={locName} onChange={e => setLocName(e.target.value)} placeholder="e.g. Central Warehouse" className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="locType" className="text-[10px] font-black uppercase text-slate-405 tracking-wider">Location Type</Label>
                  <select id="locType" value={locType} onChange={e => setLocType(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm">
                    <option value="STORE">Retail Store</option>
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="OUTLET">Outlet / Kiosk</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="locAddress" className="text-[10px] font-black uppercase text-slate-405 tracking-wider">Address</Label>
                  <Input id="locAddress" value={locAddress} onChange={e => setLocAddress(e.target.value)} placeholder="e.g. 12 Wilkinson Rd, Freetown" className="rounded-xl" />
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setIsLocationDialogOpen(false)} className="rounded-xl h-11 text-xs">Cancel</Button>
                  <Button type="submit" disabled={creatingLoc} className="rounded-xl h-11 bg-indigo-650 hover:bg-indigo-600 text-white text-xs px-6 font-bold">{creatingLoc ? "Creating..." : "Save Location"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Quick Stock Adjustment Dialog */}
          <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
            <DialogContent className="sm:max-w-md border-slate-100 bg-white dark:bg-slate-900 rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-xl font-[1000] tracking-tight uppercase text-slate-900 dark:text-white">Adjust Branch Stock</DialogTitle>
                <DialogDescription className="text-slate-500 text-xs">Directly override stock levels for a product at {adjustLocName}.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdjustStock} className="space-y-4 mt-2">
                <div className="space-y-1">
                  <Label htmlFor="adjustProduct" className="text-[10px] font-black uppercase text-slate-405 tracking-wider">Select Product *</Label>
                  <Select required value={adjustProductId} onValueChange={setAdjustProductId}>
                    <SelectTrigger className="h-11 rounded-xl bg-transparent border-slate-200 dark:border-slate-800 text-sm">
                      <SelectValue placeholder="Choose product..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 dark:border-slate-850 shadow-xl max-h-[200px]">
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="adjustQty" className="text-[10px] font-black uppercase text-slate-405 tracking-wider">New Quantity *</Label>
                  <Input 
                    id="adjustQty"
                    type="number"
                    required
                    min="0"
                    value={adjustQty}
                    onChange={e => setAdjustQty(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 100"
                    className="rounded-xl"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setIsAdjustDialogOpen(false)} className="rounded-xl h-11 text-xs">Cancel</Button>
                  <Button type="submit" disabled={adjustingStock} className="rounded-xl h-11 bg-indigo-650 hover:bg-indigo-600 text-white text-xs px-6 font-bold">
                    {adjustingStock ? "Saving..." : "Update Stock"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer transition-colors">
              <ArrowRightLeft className="h-4 w-4" /> Transfer Stock
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] w-[95vw] max-h-[95vh] rounded-[2rem] sm:rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 flex flex-col">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-6 sm:p-8 text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <ArrowRightLeft size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-[9px] font-black uppercase tracking-[0.3em] backdrop-blur-md">Logistics</div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-[1000] tracking-tighter uppercase italic leading-none drop-shadow-md">
                    Stock Transfer
                  </h3>
                  <p className="text-indigo-200 text-[10px] sm:text-[11px] font-bold mt-2 uppercase tracking-widest">
                    Move inventory securely
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleCreateTransfer} className="space-y-6">
                  
                  {/* Locations: Source -> Target */}
                  <div className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Source Location <span className="text-rose-500">*</span></Label>
                          <Select required value={fromLocId} onValueChange={setFromLocId}>
                            <SelectTrigger className="h-12 rounded-[1rem] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-bold shadow-sm">
                              <SelectValue placeholder="Select Source">
                                {fromLocId ? locations.find(l => l.id === fromLocId)?.name : "Select Source"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-[1.5rem] border-slate-100 dark:border-slate-800 shadow-xl">
                              {locations.map(l => {
                                const stockItem = l.stocks?.find((s: any) => s.productId === productId || s.product?.id === productId);
                                const qty = stockItem ? stockItem.quantity : 0;
                                const isSelectedInTarget = l.id === toLocId;
                                return (
                                  <SelectItem key={l.id} value={l.id} disabled={isSelectedInTarget} className="font-bold py-3 text-xs rounded-xl focus:bg-indigo-50 dark:focus:bg-indigo-950">
                                    <div className="flex justify-between items-center w-full min-w-[200px]">
                                      <div className="flex flex-col">
                                        <span>{l.name}</span>
                                        {l.address && <span className="text-[9px] font-normal text-slate-400">{l.address}</span>}
                                      </div>
                                      {productId && (
                                        <span className="text-[9px] px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                                          Stock: {qty}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                              {locations.length === 0 && (
                                <div className="p-4 text-xs font-bold text-slate-500 text-center">No locations available</div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                       
                       <div className="hidden sm:flex h-10 w-10 mt-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 items-center justify-center shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-800">
                         <ArrowRightLeft className="h-4 w-4" />
                       </div>
                       
                       <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Location <span className="text-rose-500">*</span></Label>
                         <Select required value={toLocId} onValueChange={setToLocId}>
                           <SelectTrigger className="h-12 rounded-[1rem] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-bold shadow-sm">
                             <SelectValue placeholder="Select Target" />
                           </SelectTrigger>
                           <SelectContent className="rounded-[1.5rem] border-slate-100 dark:border-slate-800 shadow-xl">
                             {locations.map(l => {
                               const isSelectedInSource = l.id === fromLocId;
                               return (
                                 <SelectItem key={l.id} value={l.id} disabled={isSelectedInSource} className="font-bold py-3 text-xs rounded-xl focus:bg-indigo-50 dark:focus:bg-indigo-950">
                                   <div className="flex flex-col">
                                     <span>{l.name}</span>
                                     {l.address && <span className="text-[9px] font-normal text-slate-400">{l.address}</span>}
                                   </div>
                                 </SelectItem>
                               );
                             })}
                             {locations.length === 0 && (
                               <div className="p-4 text-xs font-bold text-slate-500 text-center">No locations available</div>
                             )}
                           </SelectContent>
                         </Select>
                       </div>
                     </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                     <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Product <span className="text-rose-500">*</span></Label>
                       <Select required value={productId} onValueChange={setProductId}>
                         <SelectTrigger className="h-12 rounded-[1rem] bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold">
                           <SelectValue placeholder="Select Product">
                             {productId ? products.find(p => p.id === productId)?.name : "Select Product"}
                           </SelectValue>
                         </SelectTrigger>
                         <SelectContent className="rounded-[1.5rem] border-slate-100 dark:border-slate-800 shadow-xl">
                           {products.map(p => (
                             <SelectItem key={p.id} value={p.id} className="font-bold py-3 text-xs rounded-xl focus:bg-indigo-50 dark:focus:bg-indigo-950">
                               <div className="flex justify-between items-center w-full min-w-[200px]">
                                  <span>{p.name}</span>
                                  <span className="text-[9px] px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">Qty: {p.stockQuantity}</span>
                               </div>
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transfer Qty <span className="text-rose-500">*</span></Label>
                          <Input 
                            type="number" 
                            required 
                            min="1" 
                            value={quantity || ""} 
                            onChange={e => setQuantity(parseInt(e.target.value) || 0)} 
                            className="h-12 rounded-[1rem] bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold" 
                            placeholder="e.g. 50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reason / Note</Label>
                          <Input 
                            value={note} 
                            onChange={e => setNote(e.target.value)} 
                            placeholder="e.g. Restocking downtown..." 
                            className="h-12 rounded-[1rem] bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 font-bold" 
                          />
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsTransferDialogOpen(false)} 
                      className="flex-1 h-14 rounded-[1.2rem] font-black uppercase text-[10px] tracking-widest border-slate-200 dark:border-slate-800 text-slate-500"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={creatingTransfer} 
                      className="flex-[2] h-14 rounded-[1.2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all gap-2"
                    >
                      {creatingTransfer ? <RefreshCw className="animate-spin h-4 w-4" /> : <><ArrowRightLeft className="h-4 w-4" /> Authorize Transfer</>}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="locations" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <TabsTrigger value="locations" className="rounded-xl text-xs font-black uppercase tracking-widest px-6 py-2.5">Locations & Stock</TabsTrigger>
          <TabsTrigger value="transfers" className="rounded-xl text-xs font-black uppercase tracking-widest px-6 py-2.5">Transfers Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search branches or warehouses..." 
              value={branchSearch}
              onChange={e => setBranchSearch(e.target.value)}
              className="pl-10 h-11 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm font-semibold"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {loading ? (
              [1, 2].map(i => (
                <Card key={i} className="h-48 border-none animate-pulse bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl" />
              ))
            ) : locations.filter(loc => 
              loc.name.toLowerCase().includes(branchSearch.toLowerCase()) ||
              loc.type.toLowerCase().includes(branchSearch.toLowerCase())
            ).length === 0 ? (
              <Card className="col-span-2 border-dashed border-slate-200 p-12 text-center rounded-3xl">
                <Building2 className="h-12 w-12 text-slate-350 mx-auto mb-4" />
                <h3 className="text-sm font-black uppercase text-slate-400">No Location Nodes Found</h3>
                <p className="text-xs text-slate-550 mt-1 max-w-xs mx-auto">Create a warehouse or storefront location using the actions above.</p>
              </Card>
            ) : (
              locations.filter(loc => 
                loc.name.toLowerCase().includes(branchSearch.toLowerCase()) ||
                loc.type.toLowerCase().includes(branchSearch.toLowerCase())
              ).map(loc => (
                <Card key={loc.id} className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden relative p-6">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl flex items-center justify-center text-indigo-650 dark:text-indigo-400 font-black">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-base">{loc.name}</h3>
                        <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{loc.type}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAdjustLocId(loc.id);
                        setAdjustLocName(loc.name);
                        setAdjustProductId("");
                        setAdjustQty(0);
                        setIsAdjustDialogOpen(true);
                      }}
                      className="rounded-xl h-8 text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                    >
                      <SlidersHorizontal className="h-3 w-3 mr-1" /> Adjust Stock
                    </Button>
                  </div>
                  
                  {loc.address && (
                    <p className="text-slate-400 text-xs mt-3">{loc.address}</p>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block mb-3">Stock Allocations</span>
                    {loc.stocks && loc.stocks.length > 0 ? (
                      <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                        {loc.stocks.map((s: any) => (
                          <div key={s.id} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50 dark:border-slate-800/30 last:border-none">
                            <span className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                              <Package className="h-3.5 w-3.5 text-slate-400" /> {s.product.name}
                            </span>
                            <span className="font-black text-slate-900 dark:text-white">{s.quantity} units</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No stock allocated to this node. Click "Adjust Stock" above to add inventory.</span>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search ledger by product, node, note..." 
                value={ledgerSearch}
                onChange={e => setLedgerSearch(e.target.value)}
                className="pl-10 h-11 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm font-semibold"
              />
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "PENDING", "COMPLETED", "CANCELLED"].map(status => (
                <button
                  key={status}
                  onClick={() => setLedgerStatusFilter(status)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    ledgerStatusFilter === status
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                      : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-850">
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-6">Transfer Date</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Product Details</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Route (From → To)</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Quantity</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Status</TableHead>
                  <TableHead className="w-[150px] pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [1, 2, 3].map(i => (
                    <TableRow key={i} className="border-slate-100 dark:border-slate-850">
                      <TableCell colSpan={6} className="h-20 animate-pulse bg-slate-50/50 dark:bg-slate-800/50" />
                    </TableRow>
                  ))
                ) : transfers.filter(t => {
                  const matchesSearch = 
                    t.product.name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                    t.fromLocation.name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                    t.toLocation.name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                    (t.note && t.note.toLowerCase().includes(ledgerSearch.toLowerCase()));

                  const matchesStatus = ledgerStatusFilter === "ALL" || t.status === ledgerStatusFilter;
                  return matchesSearch && matchesStatus;
                }).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-450 font-bold italic">
                      No matching stock transfers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.filter(t => {
                    const matchesSearch = 
                      t.product.name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                      t.fromLocation.name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                      t.toLocation.name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                      (t.note && t.note.toLowerCase().includes(ledgerSearch.toLowerCase()));

                    const matchesStatus = ledgerStatusFilter === "ALL" || t.status === ledgerStatusFilter;
                    return matchesSearch && matchesStatus;
                  }).map(t => (
                    <TableRow key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-850 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <span className="font-bold text-xs text-slate-650 dark:text-slate-450">
                          {format(new Date(t.createdAt), "MMM dd, yyyy HH:mm")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 dark:text-white text-sm">{t.product.name}</span>
                          {t.note && (
                            <span className="text-[10px] text-slate-450 font-bold italic">"{t.note}"</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-350">
                          <span>{t.fromLocation.name}</span>
                          <span className="text-slate-300">→</span>
                          <span>{t.toLocation.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-black text-sm text-slate-800 dark:text-slate-300">{t.quantity} units</span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                          t.status === "COMPLETED" 
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            : t.status === "PENDING"
                            ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        )}>
                          {t.status}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-2">
                          {t.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveTransfer(t.id)}
                                className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/10 cursor-pointer"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelTransfer(t.id)}
                                className="h-8 w-8 p-0 rounded-lg border-rose-200 dark:border-rose-900/55 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 cursor-pointer"
                                title="Cancel/Reject request"
                              >
                                <X className="h-4.5 w-4.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
