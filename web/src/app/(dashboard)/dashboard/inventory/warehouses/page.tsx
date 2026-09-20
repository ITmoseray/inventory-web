"use client";

import { useState } from "react";
import { 
  Warehouse, Plus, ArrowRightLeft, Building2, Package, 
  MapPin, User, CheckCircle2, Search, Filter, ShieldCheck,
  TrendingUp, Boxes, MoreVertical, Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EnterprisePageHeader, EnterpriseKpiCard, EnterpriseBadge } from "@/components/enterprise";
import Link from "next/link";
import { toast } from "sonner";

interface WarehouseData {
  id: string;
  name: string;
  type: string;
  location: string;
  manager: string;
  products: number;
  stockValue: number;
  status: "active" | "maintenance" | "inactive";
}

const INITIAL_WAREHOUSES: WarehouseData[] = [
  { id: "wh-1", name: "Main Retail Store", type: "Retail Floor", location: "Central Business District, Freetown", manager: "Ibrahim Musa", products: 680, stockValue: 148200, status: "active" },
  { id: "wh-2", name: "Back Central Storeroom", type: "Bulk Storage", location: "Kissy Dockyard Hub", manager: "Emeka Nwosu", products: 420, stockValue: 88640, status: "active" },
  { id: "wh-3", name: "Cold & Specialty Pharmacy Store", type: "Temperature Controlled", location: "Wilkinson Road Branch", manager: "Funmi Olatunji", products: 284, stockValue: 52100, status: "active" },
  { id: "wh-4", name: "Hardware & Wholesale Depot", type: "Wholesale & Distribution", location: "Waterloo Logistics Terminal", manager: "Alpha Jalloh", products: 162, stockValue: 215400, status: "active" },
];

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>(INITIAL_WAREHOUSES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "Retail Floor",
    location: "",
    manager: "",
    products: 0,
    stockValue: 0,
  });

  const filtered = warehouses.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStockValue = warehouses.reduce((sum, w) => sum + w.stockValue, 0);
  const totalProducts = warehouses.reduce((sum, w) => sum + w.products, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newWh: WarehouseData = {
      id: `wh-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      location: formData.location || "Central Location",
      manager: formData.manager || "Unassigned",
      products: Number(formData.products) || 0,
      stockValue: Number(formData.stockValue) || 0,
      status: "active",
    };

    setWarehouses(prev => [...prev, newWh]);
    setIsNewOpen(false);
    setFormData({ name: "", type: "Retail Floor", location: "", manager: "", products: 0, stockValue: 0 });
    toast.success("Warehouse facility registered successfully.");
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#2563EB] text-white shadow-sm">
              <Warehouse className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Storage &amp; Logistics Network
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Warehouse Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage multi-warehouse storage facilities, track location stock valuation, and execute transfers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/inventory/transfers">
            <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold gap-2">
              <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600" />
              Stock Transfer
            </Button>
          </Link>
          <Button 
            onClick={() => setIsNewOpen(true)}
            size="sm"
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Warehouse
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EnterpriseKpiCard
          label="Total Facilities"
          value={warehouses.length.toString().padStart(2, "0")}
          change="Operational"
          trend="up"
          tone="blue"
          icon={<Warehouse className="h-5 w-5" />}
        />
        <EnterpriseKpiCard
          label="Total Catalog Items"
          value={totalProducts.toLocaleString()}
          change="Across nodes"
          trend="up"
          tone="indigo"
          icon={<Package className="h-5 w-5" />}
        />
        <EnterpriseKpiCard
          label="Total Inventory Value"
          value={`Le ${totalStockValue.toLocaleString()}`}
          change="Real-time value"
          trend="up"
          tone="emerald"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <EnterpriseKpiCard
          label="Network Integrity"
          value="100%"
          change="All Nodes Active"
          trend="neutral"
          tone="amber"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search warehouse by name, location, manager..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> of {warehouses.length} locations
        </div>
      </div>

      {/* Warehouse Cards Grid (Figma Make Specification) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(w => (
          <Card key={w.id} className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 rounded-2xl shadow-xs overflow-hidden hover:border-blue-500/30 transition-all group">
            <CardContent className="p-5 sm:p-6 space-y-4">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Warehouse className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {w.name}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{w.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" />
                        {w.manager}
                      </span>
                    </div>
                  </div>
                </div>
                <EnterpriseBadge variant="success" size="sm" dot>
                  {w.status}
                </EnterpriseBadge>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{w.location}</span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">Total Products</div>
                  <div className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                    {w.products.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">Stock Value</div>
                  <div className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                    Le {w.stockValue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <Link href="/dashboard/inventory/products" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full h-9 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    View Products
                  </Button>
                </Link>
                <Link href="/dashboard/inventory/transfers" className="flex-1">
                  <Button size="sm" className="w-full h-9 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50">
                    Transfer Stock
                  </Button>
                </Link>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Warehouse Dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">Register New Warehouse</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new storage facility, distribution node, or branch store to your enterprise network.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Warehouse Name</Label>
              <Input 
                required 
                placeholder="e.g. Western Distribution Hub" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 rounded-xl text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Facility Type</Label>
                <Input 
                  placeholder="e.g. Retail Floor, Storage" 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Facility Manager</Label>
                <Input 
                  placeholder="e.g. John Doe" 
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Address / Location</Label>
              <Input 
                placeholder="e.g. 14 Kissy Road, Freetown" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="h-10 rounded-xl text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
                Create Warehouse
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
