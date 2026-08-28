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
  TrendingDown, RefreshCw, Layers, Award, Check, DollarSign,
  History, Wallet, SmartphoneIcon, UserCheck, Briefcase, Zap,
  Calculator as CalculatorIcon, ArrowUpRight, ArrowDownRight,
  User, MessageSquare, ChevronDown
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
import { format } from "date-fns";

// Preset Demo Business Scenarios
const PRESETS = [
  { id: "retail", name: "Grand Central Supermarket", type: "Retail / Supermarket", icon: Store, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "pharmacy", name: "CarePlus Central Pharmacy", type: "Pharmacy & Health", icon: Stethoscope, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "wholesale", name: "Sierra Logistics & Wholesale", type: "Wholesale & Distribution", icon: Building2, color: "text-violet-500", bg: "bg-violet-500/10" },
  { id: "restaurant", name: "Ocean View Bar & Grill", type: "Restaurant & Lounge", icon: Utensils, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const TABS = ["Dashboard", "Getting Started"];

const CHART_DATA = [
  { name: "Mon", value: 42500, orders: 120 },
  { name: "Tue", value: 58200, orders: 145 },
  { name: "Wed", value: 51300, orders: 132 },
  { name: "Thu", value: 67900, orders: 168 },
  { name: "Fri", value: 84100, orders: 210 },
  { name: "Sat", value: 98600, orders: 254 },
  { name: "Sun", value: 82650, orders: 198 },
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
  { id: "INV-2026-8942", invoiceNumber: "INV-2026-8942", customer: "Freetown Mart - Lumley", items: "Basmati Rice 25kg (x2), Oil 5L (x1)", totalAmount: 1850, paymentMethod: "Orange Money", paymentStatus: "PAID", createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: "INV-2026-8941", invoiceNumber: "INV-2026-8941", customer: "Aberdeen Heights Hotel", items: "Peak Milk Carton (x2), Sugar 50kg (x1)", totalAmount: 3290, paymentMethod: "Cash", paymentStatus: "PAID", createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString() },
  { id: "INV-2026-8940", invoiceNumber: "INV-2026-8940", customer: "Kissy Road Superette", items: "Coca-Cola Cans (x5), Ariel 5kg (x2)", totalAmount: 1820, paymentMethod: "AfriMoney", paymentStatus: "PAID", createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString() },
  { id: "INV-2026-8939", invoiceNumber: "INV-2026-8939", customer: "Walk-in Cash Customer", items: "Sunflower Oil 5L (x2)", totalAmount: 580, paymentMethod: "Cash", paymentStatus: "PAID", createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: "INV-2026-8938", invoiceNumber: "INV-2026-8938", customer: "Hill Station Mini Mart", items: "Sugar 50kg (x2), Milk Carton (x1)", totalAmount: 3820, paymentMethod: "Orange Money", paymentStatus: "PAID", createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
];

const TOP_PRODUCTS = [
  { name: "Royal Basmati Rice 25kg", category: "Grains & Food", quantitySold: 148, revenue: 115440 },
  { name: "Golden Drop Sunflower Oil 5L", category: "Cooking Essentials", quantitySold: 210, revenue: 60900 },
  { name: "Peak Evaporated Milk (Carton)", category: "Dairy & Beverage", quantitySold: 84, revenue: 77280 },
  { name: "Premium Sugar Bag 50kg", category: "Commodities", quantitySold: 42, revenue: 60900 },
];

const TOP_STAFF = [
  { name: "Alpha Sesay", role: "Head Cashier • Freetown Branch", revenue: 184500 },
  { name: "Mariama Kamara", role: "Senior Sales Representative", revenue: 142200 },
  { name: "Ibrahim Conteh", role: "Store Manager • Lumley Warehouse", revenue: 98550 },
];

const SETUP_STEPS = [
  { 
    title: "Configure your Inventory", 
    desc: "Add the goods or services that your business deals with in Protech Inventory. You can also create an Item with Variants or combine multiple items into one by creating a composite item.",
    actions: [
      { label: "Create an item", icon: Plus },
      { label: "Create a composite item", icon: Box }
    ]
  },
  { 
    title: "Configure the Purchases module", 
    desc: "Set up your suppliers and manage your incoming stock orders effectively.",
    actions: [
      { label: "Add a supplier", icon: Users },
      { label: "Create purchase order", icon: FileText }
    ]
  },
  { 
    title: "Configure the Sales module", 
    desc: "Streamline your sales process with automated invoicing and fast POS checkout.",
    actions: [
      { label: "Open POS", icon: ShoppingCart },
      { label: "Add customer", icon: Users }
    ]
  },
  { 
    title: "Dispatch your order", 
    desc: "Monitor shipping and ensure your customers get their orders on time.",
    actions: [
      { label: "View sales orders", icon: Truck }
    ]
  }
];

const USEFUL_FEATURES = [
  { title: "Sales Channels", desc: "Integrate with shopping carts like Shopify, Amazon, and WooCommerce.", icon: Globe },
  { title: "Shipping Integrations", desc: "Deliver packages and monitor them every step of the way with automated dispatch.", icon: Truck },
  { title: "Roles and Permissions", desc: "Invite users and choose granular role-based access control across all branches.", icon: ShieldCheck },
  { title: "Customer Portal", desc: "Self-service portal for customers to manage transactions and track orders.", icon: Users },
  { title: "Online Payments", desc: "Receive instant mobile money payments via Orange Money and AfriMoney.", icon: CreditCard },
  { title: "Multi-Warehouse Locations", desc: "Organize your business and warehouse locations into a structured hierarchy.", icon: MapPin },
];

export function DemoDashboard() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Modals & Tool States
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isPosOpen, setIsPosOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);
  const [setupProgress, setSetupProgress] = useState(75);
  const [activeSetupStep, setActiveSetupStep] = useState(0);

  // Calculator State
  const [calcInput, setCalcInput] = useState("0");
  const [calcPrev, setCalcPrev] = useState<string | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);

  // POS State
  const [posSearch, setPosSearch] = useState("");
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

  const updateCartQty = (id: string, delta: number) => {
    setPosCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean) as any[]);
  };

  const completeSimulationSale = () => {
    toast.success("Simulated Sale Completed Successfully!", {
      description: `Payment of NLe ${cartTotal.toLocaleString()} processed via ${paymentMethod}. Receipt generated.`
    });
    setSelectedSale({
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: "Walk-in Retail Customer",
      items: posCart.map(p => `${p.product.name} (x${p.qty})`).join(", "),
      totalAmount: cartTotal,
      paymentMethod: paymentMethod,
      paymentStatus: "PAID",
      createdAt: new Date().toISOString()
    });
    setPosCart([]);
    setIsPosOpen(false);
  };

  // Calculator Logic
  const handleCalcNumber = (num: string) => {
    setCalcInput(prev => prev === "0" ? num : prev + num);
  };

  const handleCalcOp = (op: string) => {
    setCalcPrev(calcInput);
    setCalcOp(op);
    setCalcInput("0");
  };

  const handleCalcEqual = () => {
    if (!calcPrev || !calcOp) return;
    const a = parseFloat(calcPrev);
    const b = parseFloat(calcInput);
    let res = 0;
    if (calcOp === "+") res = a + b;
    if (calcOp === "-") res = a - b;
    if (calcOp === "×") res = a * b;
    if (calcOp === "÷") res = b !== 0 ? a / b : 0;
    setCalcInput(res.toString());
    setCalcPrev(null);
    setCalcOp(null);
  };

  const handleCalcClear = () => {
    setCalcInput("0");
    setCalcPrev(null);
    setCalcOp(null);
  };

  const filteredProducts = DEMO_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(posSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(posSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(posSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* 1. TOP DEMO SANDBOX BANNER */}
      <div className="bg-slate-900 border-b border-indigo-500/20 px-4 py-2 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold tracking-wider uppercase border border-indigo-500/30 animate-pulse">
              <Sparkles className="h-3 w-3" /> Demo Sandbox
            </span>
            <span className="text-xs font-bold hidden sm:inline text-slate-200">
              Protech Assist Enterprise OS
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden lg:inline">
              • Sierra Leone Cloud Node (NLe Currency)
            </span>
          </div>

          {/* Industry Preset Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase shrink-0">Preset:</span>
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
                    "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 border",
                    isSelected 
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm" 
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span>{preset.type.split('/')[0]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="h-7 px-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="h-7 px-3.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1"
            >
              Start Free Trial <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. AUTHENTIC PROTECH ENTERPRISE SIDEBAR */}
        <aside className={cn(
          "bg-white dark:bg-[hsl(222.2,47.4%,11.2%)] border-r border-slate-200 dark:border-slate-800 w-64 flex flex-col fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:relative lg:translate-x-0 pt-16 lg:pt-0",
          !isSidebarOpen && "-translate-x-full lg:hidden"
        )}>
          {/* Business Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md font-black text-base shrink-0">
                PA
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{selectedPreset.name}</h3>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                </div>
                <p className="text-[9px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 truncate uppercase tracking-wider">
                  {selectedPreset.type}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-5 overflow-y-auto custom-scrollbar">
            <div>
              <span className="px-3 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1.5">
                Main Menu
              </span>
              <div className="space-y-0.5">
                {[
                  { icon: LayoutDashboard, label: "Dashboard", active: activeNav === "Dashboard", action: () => { setActiveNav("Dashboard"); setActiveTab("Dashboard"); } },
                  { icon: ShoppingCart, label: "POS Terminal", badge: "Live", action: () => setIsPosOpen(true) },
                  { icon: Box, label: "Inventory & Stock", action: () => toast.info("Opening Inventory & Catalog Module...") },
                  { icon: FileText, label: "Sales & Invoices", action: () => toast.info("Opening Invoices & Sales Ledger...") },
                  { icon: Truck, label: "Purchases & Suppliers", action: () => toast.info("Opening Supplier & PO Management...") },
                  { icon: Users, label: "Customers & CRM", action: () => toast.info("Opening Customer Profiles & Loyalty...") },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left group",
                        item.active 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn("h-4 w-4", item.active ? "text-white" : "text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400")} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="px-3 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1.5">
                Intelligence & Finance
              </span>
              <div className="space-y-0.5">
                {[
                  { icon: BarChart3, label: "Financial Reports", action: () => toast.info("Opening Financial Analytics & P&L...") },
                  { icon: BrainCircuit, label: "AI Business Copilot", badge: "AI", action: () => setIsAiReportOpen(true) },
                  { icon: CalculatorIcon, label: "Calculator", action: () => setIsCalculatorOpen(true) },
                  { icon: Settings, label: "System Settings", action: () => toast.info("Opening System Settings & Roles...") },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-purple-500/20 text-purple-600 dark:text-purple-400">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User Session Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-white">
                DS
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">Dr. Strange</span>
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">Supreme Master Admin</span>
              </div>
            </div>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
        </aside>

        {/* 3. MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          
          {/* Top Main Header */}
          <header className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[hsl(222.2,47.4%,11.2%)]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Global Search Bar */}
              <div className="hidden md:flex items-center gap-2.5 w-full max-w-md px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products, invoices, or press ⌘K..."
                  className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-xs"
                />
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500">⌘K</kbd>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <button
                onClick={() => setIsAiReportOpen(true)}
                className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors border border-indigo-100 dark:border-indigo-500/20"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                AI Assistant
              </button>

              <button
                onClick={() => setIsCalculatorOpen(true)}
                className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Calculator"
              >
                <CalculatorIcon className="h-4 w-4" />
              </button>

              <button
                onClick={() => toast.info("Demo Notification: All 3 regional warehouses are synchronizing without errors.")}
                className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white relative transition-colors"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="h-2 w-2 rounded-full bg-indigo-600 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900" />
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                  S
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold leading-none">strangesteven001</span>
                  <span className="text-[9px] text-slate-400 font-mono">Admin Account</span>
                </div>
              </div>
            </div>
          </header>

          {/* Breadcrumb Bar */}
          <div className="px-4 sm:px-8 py-3 bg-slate-100/50 dark:bg-slate-900/30 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-indigo-600 font-medium">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-900 dark:text-white font-bold">{activeTab}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <Clock className="h-3 w-3 text-indigo-500" />
              <span>{format(currentTime, "h:mm:ss a")} GMT+0</span>
            </div>
          </div>

          {/* Page Body */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
            
            {/* Top Greeting & Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Good Afternoon, Dr. Strange 👋
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedPreset.name} • Live Executive Financials & Inventory Stream
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button 
                  variant="outline"
                  onClick={() => setIsAiReportOpen(true)}
                  className="h-9 px-4 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm"
                >
                  View Intelligence
                </Button>
                <Button 
                  onClick={() => setIsPosOpen(true)}
                  className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Create Order / Open POS
                </Button>
              </div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 relative z-10">
              {TABS.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-3 text-xs font-black uppercase tracking-widest transition-all relative shrink-0",
                    activeTab === tab 
                      ? "text-indigo-600 dark:text-indigo-400" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="demo-tab-underline" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" 
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab 1: DASHBOARD VIEW */}
            <AnimatePresence mode="wait">
              {activeTab === "Dashboard" && (
                <motion.div 
                  key="dashboard-tab-content"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  {/* Top Section: AI Assistant Card + 6 Core Stat Cards */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Protech AI Assistant Card */}
                    <div className="xl:col-span-1">
                      <div className="h-full relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-8 text-white shadow-xl flex flex-col justify-between group border border-indigo-400/20">
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
                          <Sparkles className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 mb-6 shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Protech AI Assistant</span>
                          </div>
                          <h2 className="text-3xl font-black tracking-tight leading-none mb-3">Hi Dr. Strange,</h2>
                          <p className="text-indigo-100 font-medium text-sm max-w-[220px] leading-relaxed">
                            Your store is performing well today. Revenue is up by <span className="font-bold text-emerald-300">+24.8%</span>.
                          </p>
                        </div>
                        <div className="relative z-10 mt-8">
                          <Button 
                            onClick={() => setIsAiReportOpen(true)}
                            className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-xl h-12 font-bold shadow-lg shadow-black/10 gap-2 transition-all hover:gap-4 text-xs uppercase tracking-wider"
                          >
                            Generate full report <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* 6 Core Stat Cards */}
                    <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      
                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Total Revenue</span>
                          <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <DollarSign className="h-4 w-4" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">Le 485,250.00</h3>
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                          <ArrowUpRight className="h-3.5 w-3.5" /> +24.8% vs last month
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Today's Revenue</span>
                          <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Activity className="h-4 w-4" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">Le 32,840.00</h3>
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                          <ArrowUpRight className="h-3.5 w-3.5" /> +18.4% vs yesterday
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Total Orders</span>
                          <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <ShoppingCart className="h-4 w-4" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">148</h3>
                        <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                          <ArrowUpRight className="h-3.5 w-3.5" /> +8.2% vs yesterday
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Total Products</span>
                          <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <Package className="h-4 w-4" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">2,845</h3>
                        <p className="text-[11px] font-bold text-slate-500 mt-2">Managed Catalog SKUs</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Low Stock Alerts</span>
                          <div className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">12</h3>
                        <p className="text-[11px] font-bold text-rose-500 mt-2">Requires Restock Attention</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Over Stock Alerts</span>
                          <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Box className="h-4 w-4" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">4</h3>
                        <p className="text-[11px] font-bold text-amber-500 mt-2">Excess Inventory Buffer</p>
                      </div>

                    </div>
                  </div>

                  {/* Revenue Velocity Chart + Intelligence Operational Nodes */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* 7-Day Trend Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Revenue Velocity</h3>
                          <p className="text-xs text-slate-400">Intelligence performance tracking (last 7 days)</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                          7 Days Rolling
                        </span>
                      </div>

                      <div className="h-64 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={CHART_DATA}>
                            <defs>
                              <linearGradient id="demoRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" dark-stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `Le ${val / 1000}k`} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                              formatter={(value: any) => [`Le ${Number(value).toLocaleString()}`, "Revenue"]}
                            />
                            <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fill="url(#demoRevenueGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Operational Nodes */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Intelligence Nodes</h3>
                        <p className="text-xs text-slate-400">System Operational Status</p>
                      </div>

                      <div className="space-y-3">
                        {[
                          { label: "Active Transactions", value: "24", icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
                          { label: "Inventory Thresholds", value: "12", icon: Package, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20" },
                          { label: "Staff Connectivity", value: "08", icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" }
                        ].map((node, i) => (
                          <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2.5 rounded-xl shrink-0", node.bg)}>
                                <node.icon className={cn("h-4 w-4", node.color)} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{node.label}</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{node.value}</p>
                              </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                        ))}
                      </div>

                      <Button 
                        onClick={() => toast.success("Diagnostics Complete: All regional database clusters operating at peak latency (28ms).")}
                        className="w-full h-11 rounded-xl bg-slate-900 text-white dark:bg-indigo-600 font-bold text-xs uppercase tracking-wider"
                      >
                        Launch Neural Diagnostics
                      </Button>
                    </div>
                  </div>

                  {/* AI Smart Replenishment & Expiry Guard */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* AI Smart Replenishment */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <BrainCircuit className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">AI Replenishment Assistant</h4>
                            <p className="text-[10px] font-mono text-slate-400 uppercase">Predictive Stock Depletion</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-bold">
                          AI Active
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Royal Basmati Rice 25kg</p>
                            <p className="text-[10px] font-mono text-rose-500">Stock out estimated in 3 days</p>
                          </div>
                          <Button size="sm" onClick={() => toast.success("Purchase Order PO-9821 auto-drafted to supplier!")} className="h-8 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                            Auto-PO
                          </Button>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Peak Evaporated Milk Tin (Carton)</p>
                            <p className="text-[10px] font-mono text-amber-500">Stock out estimated in 5 days</p>
                          </div>
                          <Button size="sm" onClick={() => toast.success("Purchase Order PO-9822 auto-drafted to supplier!")} className="h-8 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                            Auto-PO
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expiry Guard */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Quality & Expiry Guard</h4>
                            <p className="text-[10px] font-mono text-slate-400 uppercase">Controlled Batches</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                          100% Compliant
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Batch #B-9022 (Sunflower Oil 5L)</p>
                            <p className="text-[10px] font-mono text-slate-400">Expiry: Dec 2027 • Main Warehouse</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                            Safe
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Batch #B-8834 (Dairy Milk Tins)</p>
                            <p className="text-[10px] font-mono text-amber-500">Expiry in 45 days • FIFO Priority</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                            FIFO Push
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Recent Transactions & Top Products Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Recent Transactions */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Transactions</h3>
                          <p className="text-xs text-slate-400">Click any transaction to inspect receipt</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toast.info("Demo transaction log synchronized.")}
                          className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800"
                        >
                          View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 flex-1">
                        {DEMO_SALES.map((sale) => (
                          <div 
                            key={sale.id}
                            onClick={() => setSelectedSale(sale)}
                            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 mr-4">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                                <Activity className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{sale.invoiceNumber} • {sale.customer}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{sale.items}</p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="font-black font-mono text-xs text-slate-900 dark:text-white">Le {sale.totalAmount.toLocaleString()}</p>
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold mt-1 inline-block bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                                {sale.paymentMethod}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Top Products</h3>
                        <p className="text-xs text-slate-400">Highest volume revenue items</p>
                      </div>

                      <div className="space-y-3.5 my-4">
                        {TOP_PRODUCTS.map((prod, i) => (
                          <div key={i} className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                                #{i + 1}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{prod.name}</p>
                                <p className="text-[10px] text-slate-400">{prod.quantitySold} units sold</p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                              Le {prod.revenue.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        onClick={() => setIsPosOpen(true)}
                        className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                      >
                        Open POS Simulator
                      </Button>
                    </div>

                  </div>

                  {/* Staff Leaderboard */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Staff Leaderboard</h3>
                        <p className="text-xs text-slate-400">Top Revenue Generators this Month</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold">
                        3 Active Cashiers
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {TOP_STAFF.map((staff, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                              #{i + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{staff.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{staff.role}</p>
                            </div>
                          </div>
                          <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                            Le {staff.revenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* Tab 2: GETTING STARTED VIEW */}
              {activeTab === "Getting Started" && (
                <motion.div 
                  key="getting-started-tab-content"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-10"
                >
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      Welcome to <span className="text-indigo-600">Protech Inventory</span>
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mt-2">Overview of Protech Assist OS</p>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2 max-w-2xl leading-relaxed">
                      The easy-to-use trade & inventory software that you can set up in no time! Let's get your business up and running effectively.
                    </p>
                  </div>

                  {/* Checklist Card */}
                  <Card className="border-none bg-white dark:bg-slate-900 shadow-xl rounded-3xl overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/40">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                          <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Let's get you up and running</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Phase 01 Configuration</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-2xl font-black text-indigo-600">{setupProgress}%</span>
                          <div className="w-36 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${setupProgress}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step Navigation */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-100 dark:border-slate-800">
                      {SETUP_STEPS.map((step, i) => (
                        <button 
                          key={i}
                          onClick={() => setActiveSetupStep(i)}
                          className={cn(
                            "p-4 flex flex-col items-center text-center gap-2 transition-all border-r last:border-0 border-slate-100 dark:border-slate-800",
                            activeSetupStep === i ? "bg-indigo-50/50 dark:bg-slate-800/60" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                          )}
                        >
                          <div className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                            activeSetupStep === i ? "bg-indigo-600 text-white shadow-md" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                          )}>
                            {i + 1}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{step.title}</span>
                        </button>
                      ))}
                    </div>

                    {/* Step Content */}
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-900 dark:text-white">{SETUP_STEPS[activeSetupStep].title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">{SETUP_STEPS[activeSetupStep].desc}</p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {SETUP_STEPS[activeSetupStep].actions.map((act, idx) => {
                          const Icon = act.icon;
                          return (
                            <Button 
                              key={idx}
                              onClick={() => {
                                if (act.label.includes("POS")) setIsPosOpen(true);
                                else toast.success(`Simulated action: ${act.label}`);
                              }}
                              className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                            >
                              <Icon className="h-4 w-4 mr-2" /> {act.label}
                            </Button>
                          );
                        })}
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSetupProgress(prev => Math.min(100, prev + 25));
                            toast.success(`Marked "${SETUP_STEPS[activeSetupStep].title}" as completed!`);
                          }}
                          className="h-11 px-5 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold"
                        >
                          Mark as Completed
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Useful Features Grid */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Core Enterprise Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {USEFUL_FEATURES.map((feat, idx) => {
                        const Icon = feat.icon;
                        return (
                          <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                              <Icon className="h-4 w-4" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{feat.title}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Support & Hotline Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl" />
                      <h4 className="text-lg font-black tracking-tight">Have a question?</h4>
                      <p className="text-xs text-slate-400">Write to us directly or call our direct executive support hotline.</p>
                      <div className="flex gap-3">
                        <Button onClick={() => window.open("mailto:support.africa@protechassist.com")} className="h-11 bg-white text-slate-900 font-bold text-xs rounded-xl">
                          <MessageCircle className="h-4 w-4 mr-2" /> Mail Us
                        </Button>
                        <Button onClick={() => window.open("https://wa.me/23273019699")} className="h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl">
                          WhatsApp: 073019699
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-xl space-y-4">
                      <h4 className="text-lg font-black tracking-tight">Live Guided Onboarding</h4>
                      <p className="text-xs text-indigo-200">Let our senior software engineers show you how to maximize your inventory ROI.</p>
                      <Button onClick={() => window.open("https://wa.me/23273019699?text=Hello%20Protech,%20I%20would%20like%20to%20book%20a%20live%20guided%20onboarding%20session.")} className="h-11 bg-white text-indigo-900 font-bold text-xs rounded-xl">
                        Schedule Live Demo Call
                      </Button>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>

      {/* 4. INTERACTIVE POINT OF SALE (POS) MODAL */}
      <AnimatePresence>
        {isPosOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-4xl w-full h-[90vh] max-h-[750px] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* POS Modal Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">Point of Sale Terminal</h3>
                    <p className="text-[10px] font-mono text-emerald-400">Scanner & Offline Mode Ready 🟢</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPosOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* POS Modal Content */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
                
                {/* Product Catalog */}
                <div className="md:col-span-2 p-4 flex flex-col border-r border-slate-800 overflow-hidden space-y-4">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      placeholder="Search items by name, SKU or category..."
                      className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3 custom-scrollbar">
                    {filteredProducts.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => addToCart(prod)}
                        className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-slate-850 text-left transition-all group flex flex-col justify-between h-32"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] font-mono uppercase text-slate-500">{prod.sku}</span>
                            <span className="text-[9px] font-bold text-emerald-400">{prod.stock} left</span>
                          </div>
                          <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-indigo-400">
                            {prod.name}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                          <span className="text-xs font-black text-indigo-400">NLe {prod.price}</span>
                          <div className="h-5 w-5 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white">
                            <Plus className="h-3 w-3" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cart Summary & Checkout */}
                <div className="p-4 flex flex-col justify-between bg-slate-950/40 space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h4 className="text-xs font-extrabold text-white">Active Cart</h4>
                      <span className="text-[10px] font-mono text-slate-400">{posCart.length} item(s)</span>
                    </div>

                    <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                      {posCart.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs">
                          Cart is empty. Click any item to add.
                        </div>
                      ) : (
                        posCart.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-white truncate text-[11px]">{item.product.name}</p>
                              <p className="text-[9px] font-mono text-slate-400">NLe {item.product.price} × {item.qty}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => updateCartQty(item.product.id, -1)} className="h-5 w-5 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">-</button>
                              <span className="text-xs font-mono font-bold px-1">{item.qty}</span>
                              <button onClick={() => updateCartQty(item.product.id, 1)} className="h-5 w-5 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">+</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-mono font-bold text-white">NLe {cartSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (5%):</span>
                        <span className="font-mono font-bold text-white">NLe {cartTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-white pt-1.5 border-t border-slate-800">
                        <span>Total:</span>
                        <span className="text-emerald-400 font-mono">NLe {cartTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      {["Orange Money", "Cash", "Card"].map((m) => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={cn(
                            "py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                            paymentMethod === m ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={completeSimulationSale}
                      disabled={posCart.length === 0}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase"
                    >
                      <Printer className="h-4 w-4 mr-1.5" /> Complete Sale & Print
                    </Button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. INTERACTIVE THERMAL RECEIPT MODAL */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative"
            >
              <button
                onClick={() => setSelectedSale(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-200">
                <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black mx-auto mb-2 shadow-md">
                  PA
                </div>
                <h3 className="font-black text-lg text-slate-900">{selectedPreset.name}</h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase">Protech Assist Enterprise OS • Freetown, SL</p>
                <p className="text-xs font-mono font-bold text-indigo-600">{selectedSale.invoiceNumber || selectedSale.id}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 font-mono">
                  <span>Customer:</span>
                  <span className="font-bold text-slate-900">{selectedSale.customer}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-mono">
                  <span>Payment Channel:</span>
                  <span className="font-bold text-emerald-600">{selectedSale.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-mono">
                  <span>Timestamp:</span>
                  <span className="text-slate-900">{format(new Date(selectedSale.createdAt), "MMM dd, yyyy • HH:mm")}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Purchased Goods:</p>
                  <p className="font-bold text-slate-800">{selectedSale.items}</p>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                <span className="font-black text-sm uppercase">Total Paid:</span>
                <span className="text-xl font-black font-mono text-slate-900">Le {parseFloat(selectedSale.totalAmount).toLocaleString()}</span>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    toast.success("Thermal receipt dispatched to printer!");
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

      {/* 6. PROFESSIONAL CALCULATOR MODAL */}
      <AnimatePresence>
        {isCalculatorOpen && (
          <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-xs w-full p-6 shadow-2xl space-y-4 relative"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CalculatorIcon className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold">Protech Calculator</span>
                </div>
                <button onClick={() => setIsCalculatorOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Display */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right">
                <span className="text-xs font-mono text-slate-500 block h-4">{calcPrev ? `${calcPrev} ${calcOp}` : ""}</span>
                <span className="text-2xl font-black font-mono text-white tracking-tight">{calcInput}</span>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-4 gap-2 text-sm font-bold font-mono">
                <button onClick={handleCalcClear} className="p-3 rounded-xl bg-slate-800 text-rose-400 hover:bg-slate-700">C</button>
                <button onClick={() => handleCalcOp("÷")} className="p-3 rounded-xl bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white">÷</button>
                <button onClick={() => handleCalcOp("×")} className="p-3 rounded-xl bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white">×</button>
                <button onClick={() => handleCalcOp("-")} className="p-3 rounded-xl bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white">-</button>

                {["7", "8", "9"].map(n => <button key={n} onClick={() => handleCalcNumber(n)} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700">{n}</button>)}
                <button onClick={() => handleCalcOp("+")} className="p-3 rounded-xl bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white row-span-2 flex items-center justify-center">+</button>

                {["4", "5", "6"].map(n => <button key={n} onClick={() => handleCalcNumber(n)} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700">{n}</button>)}

                {["1", "2", "3"].map(n => <button key={n} onClick={() => handleCalcNumber(n)} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700">{n}</button>)}
                <button onClick={handleCalcEqual} className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white row-span-2 flex items-center justify-center">=</button>

                <button onClick={() => handleCalcNumber("0")} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 col-span-2">0</button>
                <button onClick={() => handleCalcNumber(".")} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700">.</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. AI BUSINESS REPORT MODAL */}
      <AnimatePresence>
        {isAiReportOpen && (
          <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative"
            >
              <button onClick={() => setIsAiReportOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Protech AI Copilot • Executive Summary</h3>
                  <p className="text-[10px] font-mono text-indigo-400">Generated for Dr. Strange</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-300 leading-relaxed">
                <p className="font-bold text-white">📈 Key Insights for ${selectedPreset.name}:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Revenue Velocity:</strong> Up by <strong>24.8%</strong> compared to previous cycle, driven by FMCG bulk sales.</li>
                  <li><strong>Payment Preference:</strong> <strong>Orange Money</strong> represents 46% of total settlement volume.</li>
                  <li><strong>Replenishment Alert:</strong> <strong>Royal Basmati Rice</strong> stock is at critical velocity; automated PO recommended.</li>
                  <li><strong>Expiry Risk:</strong> 0 batch violations detected. Controlled goods compliant with Pharmacy Board SLA.</li>
                </ul>
              </div>

              <Button onClick={() => { toast.success("Executive PDF report generated!"); setIsAiReportOpen(false); }} className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl">
                Download PDF Executive Report
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
