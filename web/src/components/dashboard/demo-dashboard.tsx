"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, ShoppingCart, Users, BarChart3, Settings, 
  Search, Bell, Info, ChevronRight, PieChart, TrendingUp, 
  Clock, CheckCircle2, AlertCircle, Box, Truck, Filter,
  ExternalLink, Play, HelpCircle, MessageCircle, FileText,
  Smartphone, Globe, LayoutDashboard, Database, Activity,
  Calendar, Menu, X, ArrowRight, ShieldCheck, CreditCard,
  MapPin, Plus, Sparkles, BrainCircuit, Receipt, Printer,
  Store, Building2, Stethoscope, Utensils, GraduationCap,
  TrendingDown, RefreshCw, Layers, Award, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell 
} from "recharts";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Preset Demo Business Scenarios
const PRESETS = [
  { id: "retail", name: "Grand Central Supermarket", type: "Retail / Supermarket", icon: Store, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "pharmacy", name: "CarePlus Central Pharmacy", type: "Pharmacy & Health", icon: Stethoscope, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "wholesale", name: "Sierra Logistics & Wholesale", type: "Wholesale & Distribution", icon: Building2, color: "text-violet-500", bg: "bg-violet-500/10" },
  { id: "restaurant", name: "Ocean View Bar & Grill", type: "Restaurant & Lounge", icon: Utensils, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const REVENUE_DATA = [
  { name: "Mon", revenue: 42500, orders: 120 },
  { name: "Tue", revenue: 58200, orders: 145 },
  { name: "Wed", revenue: 51300, orders: 132 },
  { name: "Thu", revenue: 67900, orders: 168 },
  { name: "Fri", revenue: 84100, orders: 210 },
  { name: "Sat", revenue: 98600, orders: 254 },
  { name: "Sun", revenue: 82650, orders: 198 },
];

const PAYMENT_DATA = [
  { name: "Orange Money", value: 46, color: "#f97316" },
  { name: "Cash (NLe)", value: 34, color: "#10b981" },
  { name: "AfriMoney / Card", value: 20, color: "#6366f1" },
];

const DEMO_PRODUCTS = [
  { id: "p1", name: "Royal Basmati Rice 25kg", sku: "RICE-25KG", category: "Grains & Food", price: 780, stock: 45, unit: "Bags" },
  { id: "p2", name: "Golden Drop Sunflower Oil 5L", sku: "OIL-5L", category: "Cooking Essentials", price: 290, stock: 82, unit: "Gallons" },
  { id: "p3", name: "Peak Evaporated Milk Tin (Carton)", sku: "MILK-PK-48", category: "Dairy & Beverage", price: 920, stock: 18, unit: "Cartons" },
  { id: "p4", name: "Premium Sugar Bag 50kg", sku: "SUG-50KG", category: "Commodities", price: 1450, stock: 8, unit: "Bags" },
  { id: "p5", name: "Coca-Cola 330ml Cans (24 Pack)", sku: "COKE-CAN-24", category: "Beverages", price: 240, stock: 120, unit: "Packs" },
  { id: "p6", name: "Ariel Platinum Washing Powder 5kg", sku: "ARIEL-5KG", category: "Household Goods", price: 310, stock: 64, unit: "Boxes" },
];

const DEMO_SALES = [
  { id: "INV-2026-8942", customer: "Freetown Mart - Lumley", items: "Basmati Rice 25kg (x2), Oil 5L (x1)", amount: 1850, method: "Orange Money", time: "2 mins ago", status: "Completed" },
  { id: "INV-2026-8941", customer: "Aberdeen Heights Hotel", items: "Peak Milk Carton (x2), Sugar 50kg (x1)", amount: 3290, method: "Cash", time: "14 mins ago", status: "Completed" },
  { id: "INV-2026-8940", customer: "Kissy Road Superette", items: "Coca-Cola Cans (x5), Ariel 5kg (x2)", amount: 1820, method: "AfriMoney", time: "32 mins ago", status: "Completed" },
  { id: "INV-2026-8939", customer: "Walk-in Cash Customer", items: "Sunflower Oil 5L (x2)", amount: 580, method: "Cash", time: "45 mins ago", status: "Completed" },
  { id: "INV-2026-8938", customer: "Hill Station Mini Mart", items: "Sugar 50kg (x2), Milk Carton (x1)", amount: 3820, method: "Orange Money", time: "1 hr ago", status: "Completed" },
];

export function DemoDashboard() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSale, setSelectedSale] = useState<any>(null);
  
  const [posCart, setPosCart] = useState<{ product: any; qty: number }[]>([
    { product: DEMO_PRODUCTS[0], qty: 1 },
    { product: DEMO_PRODUCTS[1], qty: 2 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("Orange Money");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cartSubtotal = posCart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const cartTax = Math.round(cartSubtotal * 0.05);
  const cartTotal = cartSubtotal + cartTax;

  const addToCart = (product: any) => {
    setPosCart(prev => {
      const existing = prev.find(p => p.product.id === product.id);
      if (existing) {
        return prev.map(p => p.product.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`Added ${product.name} to cart!`);
  };

  const completeSimulationSale = () => {
    toast.success("Simulated Sale Completed Successfully!", {
      description: `Payment of NLe ${cartTotal.toLocaleString()} processed via ${paymentMethod}. Receipt generated.`
    });
    setSelectedSale({
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: "Walk-in Retail Customer",
      items: posCart.map(p => `${p.product.name} (x${p.qty})`).join(", "),
      amount: cartTotal,
      method: paymentMethod,
      time: "Just now",
      status: "Completed"
    });
    setPosCart([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      <header className="sticky top-0 z-[60] bg-slate-900/95 backdrop-blur-xl border-b border-indigo-500/20 px-4 py-2.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold tracking-wider uppercase border border-indigo-500/30 animate-pulse">
              <Sparkles className="h-3 w-3" /> Live Demo Sandbox
            </span>
            <span className="text-xs font-bold text-white hidden sm:inline">
              Protech Assist Enterprise OS
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden lg:inline">
              • Sierra Leone Cloud Node (NLe Currency)
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase shrink-0">Switch Scenario:</span>
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset);
                    toast.info(`Switched demo node to: ${preset.name}`);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border",
                    isSelected 
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/50" 
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{preset.type.split('/')[0]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="h-8 px-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="h-8 px-3.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1"
            >
              Start Free Trial <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        <aside className={cn(
          "bg-slate-900 border-r border-slate-800 w-72 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:relative lg:translate-x-0 pt-16 lg:pt-0",
          !isSidebarOpen && "-translate-x-full lg:hidden"
        )}>
          <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0 font-black text-lg">
                PA
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white truncate">{selectedPreset.name}</h3>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                </div>
                <p className="text-[10px] font-mono font-semibold text-indigo-400 truncate uppercase tracking-wider">
                  {selectedPreset.type}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
            <div>
              <span className="px-3 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 block mb-2">
                Operations Core
              </span>
              <div className="space-y-1">
                {[
                  { icon: LayoutDashboard, label: "Dashboard", badge: "Live" },
                  { icon: ShoppingCart, label: "POS Terminal", badge: "Interactive" },
                  { icon: Box, label: "Inventory & Stock" },
                  { icon: FileText, label: "Sales & Invoicing" },
                  { icon: Truck, label: "Purchases & Orders" },
                  { icon: Users, label: "Customers & CRM" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.label;
                  return (
                    <button
                      key={item.label}
                      onClick={() => setActiveNav(item.label)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left",
                        isActive 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase",
                          isActive ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-400"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="px-3 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 block mb-2">
                Intelligence & Finance
              </span>
              <div className="space-y-1">
                {[
                  { icon: BarChart3, label: "Financial Reports" },
                  { icon: BrainCircuit, label: "AI Business Copilot", badge: "AI" },
                  { icon: Settings, label: "System Configuration" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.label;
                  return (
                    <button
                      key={item.label}
                      onClick={() => setActiveNav(item.label)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left",
                        isActive 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-purple-500/20 text-purple-400">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">
                DS
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Dr. Strange</span>
                <span className="text-[9px] font-mono text-emerald-400">Supreme Super Admin</span>
              </div>
            </div>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-950">
          
          {/* Header Bar */}
          <div className="h-16 px-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>{selectedPreset.name}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                <span className="text-white font-bold">{activeNav}</span>
              </div>
            </div>

            {/* Quick Status / Clock */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span>{currentTime.toLocaleTimeString()} GMT+0</span>
              </div>

              <Button
                onClick={() => setActiveNav(activeNav === "POS Terminal" ? "Dashboard" : "POS Terminal")}
                className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>{activeNav === "POS Terminal" ? "Back to Dashboard" : "Quick POS Mode"}</span>
              </Button>
            </div>
          </div>

          {/* Dynamic Content based on Active Nav */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
            
            {activeNav === "POS Terminal" ? (
              /* INTERACTIVE POS TERMINAL SIMULATOR */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Catalog Grid */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-white tracking-tight">Point of Sale Terminal</h2>
                      <p className="text-xs text-slate-400">Tap items below to add to customer cart</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                      Scanner Ready 🟢
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {DEMO_PRODUCTS.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => addToCart(prod)}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left transition-all group flex flex-col justify-between h-36"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">{prod.sku}</span>
                            <span className="text-[10px] font-bold text-emerald-400">{prod.stock} {prod.unit} left</span>
                          </div>
                          <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">
                            {prod.name}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          <span className="text-sm font-black text-indigo-400">NLe {prod.price}</span>
                          <div className="h-6 w-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Plus className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Checkout Summary */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <h3 className="text-base font-extrabold text-white">Active Order</h3>
                      <span className="text-xs font-mono text-slate-400">{posCart.length} item(s)</span>
                    </div>

                    <div className="mt-4 space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {posCart.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs">
                          Cart is empty. Click any product to simulate a sale!
                        </div>
                      ) : (
                        posCart.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-white truncate">{item.product.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">NLe {item.product.price} × {item.qty}</p>
                            </div>
                            <span className="font-mono font-black text-indigo-400">
                              NLe {item.product.price * item.qty}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-mono font-bold text-white">NLe {cartSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST / Sales Tax (5%):</span>
                        <span className="font-mono font-bold text-white">NLe {cartTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                        <span>Grand Total:</span>
                        <span className="text-emerald-400 font-mono">NLe {cartTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">Payment Route:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["Orange Money", "Cash", "Card"].map((method) => (
                          <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={cn(
                              "py-2 rounded-xl text-xs font-bold transition-all border text-center",
                              paymentMethod === method
                                ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                            )}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={completeSimulationSale}
                      disabled={posCart.length === 0}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30"
                    >
                      <Printer className="h-4 w-4 mr-2" /> Complete Sale & Print Receipt
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* MAIN EXECUTIVE DASHBOARD VIEW */
              <>
                {/* Greeting & Top Stats Grid */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Good Afternoon, Dr. Strange 👋
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedPreset.name} • Live Executive Financials & Inventory Stream
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      All 3 Warehouses Online
                    </span>
                  </div>
                </div>

                {/* 4 Core Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/20 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 tracking-wider">Total Monthly Revenue</span>
                      <div className="h-8 w-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <CreditCard className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-white font-mono tracking-tight">NLe 485,250.00</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-emerald-400">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>+24.8% vs last month</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/20 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">Today's POS Gross</span>
                      <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-white font-mono tracking-tight">NLe 32,840.00</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>148 Completed Orders</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-500/20 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase font-bold text-purple-400 tracking-wider">Catalog SKUs</span>
                      <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Box className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-white font-mono tracking-tight">2,845 Items</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-purple-400">
                      <Layers className="h-3.5 w-3.5" />
                      <span>3 Active Warehouses</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-500/20 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">Low Stock Warnings</span>
                      <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-amber-400 font-mono tracking-tight">12 SKUs</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-amber-300">
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Restock recommended</span>
                    </div>
                  </div>
                </div>

                {/* Charts Grid: 7-Day Revenue Curve + Payment Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Curve */}
                  <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-white">Sales & Revenue Intensity</h3>
                        <p className="text-xs text-slate-400">Weekly transaction performance across all channels</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                        7 Days Rolling
                      </span>
                    </div>

                    <div className="h-64 w-full pt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={REVENUE_DATA}>
                          <defs>
                            <linearGradient id="demoRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `NLe ${val / 1000}k`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                            formatter={(value: any) => [`NLe ${Number(value).toLocaleString()}`, "Revenue"]}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#demoRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Payment Distribution */}
                  <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-white">Payment Methods</h3>
                      <p className="text-xs text-slate-400">Local payment channels volume</p>
                    </div>

                    <div className="h-44 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={PAYMENT_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {PAYMENT_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                            formatter={(val: any) => [`${val}%`, "Share"]}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      {PAYMENT_DATA.map((p) => (
                        <div key={p.name} className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                            <span className="text-slate-300">{p.name}</span>
                          </div>
                          <span className="font-mono font-bold text-white">{p.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Forecasting & Expiry Alerts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AI Smart Replenishment */}
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                          <BrainCircuit className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white">AI Replenishment Assistant</h4>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">Predictive Stock Depletion</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold">
                        AI Active
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Royal Basmati Rice 25kg</p>
                          <p className="text-[10px] font-mono text-rose-400">Stock out estimated in 3 days</p>
                        </div>
                        <Button size="sm" onClick={() => toast.success("Restock Purchase Order PO-9821 drafted!")} className="h-8 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                          Auto-PO
                        </Button>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Peak Evaporated Milk Tin</p>
                          <p className="text-[10px] font-mono text-amber-400">Stock out estimated in 5 days</p>
                        </div>
                        <Button size="sm" onClick={() => toast.success("Restock Purchase Order PO-9822 drafted!")} className="h-8 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                          Auto-PO
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Batch Tracking & Expiry */}
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white">Quality & Expiry Guard</h4>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">Controlled Batches</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                        100% Compliant
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Batch #B-9022 (Sunflower Oil 5L)</p>
                          <p className="text-[10px] font-mono text-slate-400">Expiry: Dec 2027 • Warehouse 1</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold">
                          Safe
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Batch #B-8834 (Dairy Milk Tins)</p>
                          <p className="text-[10px] font-mono text-amber-400">Expiry in 45 days • FIFO Priority</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-mono font-bold">
                          FIFO Push
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Live Recent Sales Ledger */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-white">Live Transactions Ledger</h3>
                      <p className="text-xs text-slate-400">Click any transaction to preview receipt</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.info("Demo transaction log is live and synchronizing.")}
                      className="border-slate-700 bg-slate-800 text-xs font-bold text-slate-200"
                    >
                      <RefreshCw className="h-3 w-3 mr-1.5" /> Sync Ledger
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] font-mono uppercase text-slate-400 bg-slate-950/60 border-y border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Invoice #</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Items Summary</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Payment Method</th>
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {DEMO_SALES.map((sale) => (
                          <tr 
                            key={sale.id}
                            onClick={() => setSelectedSale(sale)}
                            className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{sale.id}</td>
                            <td className="py-3.5 px-4 font-bold text-white">{sale.customer}</td>
                            <td className="py-3.5 px-4 text-slate-300 truncate max-w-xs">{sale.items}</td>
                            <td className="py-3.5 px-4 font-mono font-black text-white">NLe {sale.amount.toLocaleString()}</td>
                            <td className="py-3.5 px-4">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold",
                                sale.method === "Orange Money" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                                sale.method === "Cash" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              )}>
                                {sale.method}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-400">{sale.time}</td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="text-xs font-bold text-indigo-400 hover:underline">View Receipt</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>

      {/* Interactive Receipt Modal */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative"
            >
              <button
                onClick={() => setSelectedSale(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-200">
                <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black mx-auto mb-2 shadow-md">
                  PA
                </div>
                <h3 className="font-black text-lg text-slate-900">{selectedPreset.name}</h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase">Protech Assist Enterprise OS • Freetown, SL</p>
                <p className="text-xs font-mono font-bold text-indigo-600">{selectedSale.id}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 font-mono">
                  <span>Customer:</span>
                  <span className="font-bold text-slate-900">{selectedSale.customer}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-mono">
                  <span>Payment Channel:</span>
                  <span className="font-bold text-emerald-600">{selectedSale.method}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-mono">
                  <span>Timestamp:</span>
                  <span className="text-slate-900">{selectedSale.time}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Purchased Goods:</p>
                  <p className="font-bold text-slate-800">{selectedSale.items}</p>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                <span className="font-black text-sm uppercase">Total Paid:</span>
                <span className="text-xl font-black font-mono text-slate-900">NLe {selectedSale.amount.toLocaleString()}</span>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    toast.success("Thermal receipt sent to printer!");
                    setSelectedSale(null);
                  }}
                  className="flex-1 h-11 bg-slate-900 text-white font-bold text-xs rounded-xl"
                >
                  <Printer className="h-4 w-4 mr-2" /> Print Receipt
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedSale(null)}
                  className="h-11 border-slate-200 text-xs font-bold rounded-xl"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
