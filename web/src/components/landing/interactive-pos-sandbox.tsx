"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Sparkles, 
  Receipt, Smartphone, CreditCard, Wallet, RotateCcw, ArrowRight,
  Package, Tag, Zap, ShieldCheck, Printer, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  barcode: string;
}

const SAMPLE_PRODUCTS: ProductItem[] = [
  {
    id: "p1",
    name: "Basmati Rice 5kg Premium",
    category: "Groceries",
    price: 320,
    image: "🍚",
    stock: 45,
    barcode: "600123456789",
  },
  {
    id: "p2",
    name: "Paracetamol 500mg (10x10)",
    category: "Pharmacy",
    price: 45,
    image: "💊",
    stock: 120,
    barcode: "600987654321",
  },
  {
    id: "p3",
    name: "Dutch Gold Milk (400g)",
    category: "Groceries",
    price: 95,
    image: "🥛",
    stock: 60,
    barcode: "600555444333",
  },
  {
    id: "p4",
    name: "Chilled Energy Drink (330ml)",
    category: "Beverages",
    price: 35,
    image: "🥤",
    stock: 85,
    barcode: "600111222333",
  },
  {
    id: "p5",
    name: "Premium Sunflower Oil (1L)",
    category: "Groceries",
    price: 110,
    image: "🌻",
    stock: 30,
    barcode: "600777888999",
  },
  {
    id: "p6",
    name: "Luxury Body Wash (500ml)",
    category: "Personal Care",
    price: 140,
    image: "🧴",
    stock: 25,
    barcode: "600444333222",
  },
];

interface CartItem {
  product: ProductItem;
  quantity: number;
}

export function InteractivePosSandbox() {
  const [cart, setCart] = useState<CartItem[]>([
    { product: SAMPLE_PRODUCTS[0], quantity: 1 },
    { product: SAMPLE_PRODUCTS[3], quantity: 2 },
  ]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "ORANGE_MONEY" | "AFRIMONEY" | "CARD">("ORANGE_MONEY");
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["ALL", "Groceries", "Pharmacy", "Beverages", "Personal Care"];

  const filteredProducts = SAMPLE_PRODUCTS.filter((p) => {
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const gstTax = subtotal * 0.15; // 15% GST Sierra Leone
  const total = subtotal + gstTax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setCompletedOrder({
        orderNumber: `SL-POS-${Math.floor(100000 + Math.random() * 900000)}`,
        items: [...cart],
        subtotal,
        gstTax,
        total,
        paymentMethod,
        date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      });
      setIsProcessing(false);
    }, 900);
  };

  const resetSandbox = () => {
    setCompletedOrder(null);
    setCart([
      { product: SAMPLE_PRODUCTS[0], quantity: 1 },
      { product: SAMPLE_PRODUCTS[3], quantity: 2 },
    ]);
  };

  return (
    <section id="pos-sandbox" className="py-20 lg:py-28 bg-slate-950 text-white relative overflow-hidden border-b border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/60 backdrop-blur-md text-indigo-300 text-xs font-black uppercase tracking-widest">
            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            Interactive Live Sandbox Demo
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase italic">
            Test Drive Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">High-Speed POS</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-medium">
            Click any product below to simulate a real-time cashier checkout, multi-item scanning, 15% NRA GST calculation, and instant receipt generation.
          </p>
        </div>

        {/* The Sandbox Terminal Frame */}
        <div className="max-w-6xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Side: Product Catalog & Touch Grid (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Terminal Subheader */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Terminal #01 (Main POS Counter)</span>
                </div>
                {/* Search Bar */}
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search product or barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                        : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Products Touch Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((product) => {
                  const inCartItem = cart.find((i) => i.product.id === product.id);
                  return (
                    <motion.button
                      key={product.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => addToCart(product)}
                      className={`p-3.5 rounded-2xl text-left transition-all border relative flex flex-col justify-between cursor-pointer group ${
                        inCartItem
                          ? "bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-500/10"
                          : "bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80"
                      }`}
                    >
                      {inCartItem && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                          {inCartItem.quantity}
                        </div>
                      )}
                      <div>
                        <span className="text-2xl block mb-1.5">{product.image}</span>
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {product.name}
                        </h4>
                        <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                          Stock: {product.stock} units
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/40">
                        <span className="text-xs font-black text-amber-400">Le {product.price.toLocaleString()}</span>
                        <div className="h-6 w-6 rounded-lg bg-indigo-600/20 group-hover:bg-indigo-600 text-indigo-400 group-hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Quick barcode simulation hint */}
            <div className="mt-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Barcode Scanner &amp; Thermal Printer integration built-in
              </span>
              <span className="text-indigo-400 font-bold hidden sm:inline">0.12s Scan Speed</span>
            </div>
          </div>

          {/* Right Side: Cashier Cart & Instant Checkout Receipt (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-950/80 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {completedOrder ? (
                /* Order Receipt Screen */
                <motion.div
                  key="receipt"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4 flex flex-col justify-between h-full"
                >
                  <div className="space-y-3">
                    <div className="text-center pb-3 border-b border-dashed border-slate-800 space-y-1">
                      <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-black text-white uppercase tracking-wider">Sale Complete &amp; Reconciled!</h3>
                      <p className="text-[11px] text-slate-400">Order ID: {completedOrder.orderNumber} • {completedOrder.date}</p>
                    </div>

                    {/* Receipt Items */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1 text-xs">
                      {completedOrder.items.map((item: CartItem) => (
                        <div key={item.product.id} className="flex justify-between items-center py-1 border-b border-slate-900">
                          <span className="text-slate-300 font-medium">
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="font-bold text-white">Le {(item.product.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals Breakdown */}
                    <div className="space-y-1 pt-2 border-t border-dashed border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal</span>
                        <span>Le {completedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>NRA GST Tax (15%)</span>
                        <span>Le {completedOrder.gstTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-black text-sm text-amber-400 pt-1 border-t border-slate-800">
                        <span>Total Paid</span>
                        <span>Le {completedOrder.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-indigo-400 font-bold pt-0.5">
                        <span>Payment Channel</span>
                        <span>{completedOrder.paymentMethod.replace("_", " ")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3">
                    <Button
                      onClick={resetSandbox}
                      className="w-full h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs gap-2 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Start New Simulated Sale
                    </Button>
                    <Link
                      href="/register"
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      Deploy This POS For Your Store <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                /* Active Cart Screen */
                <motion.div
                  key="cart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex flex-col justify-between h-full"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-indigo-400" />
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">
                          Current Cart ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
                        </h3>
                      </div>
                      {cart.length > 0 && (
                        <button
                          onClick={clearCart}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                        >
                          Clear Cart
                        </button>
                      )}
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {cart.length === 0 ? (
                        <div className="py-10 text-center text-slate-500 space-y-1">
                          <Package className="h-8 w-8 mx-auto opacity-40 mb-2" />
                          <p className="text-xs font-bold">Cart is empty</p>
                          <p className="text-[10px]">Click products on the left to add items.</p>
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div
                            key={item.product.id}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">{item.product.name}</p>
                              <span className="text-[10px] text-amber-400 font-semibold">
                                Le {item.product.price} each
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateQuantity(item.product.id, -1)}
                                className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-black text-white w-5 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, 1)}
                                className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="h-6 w-6 rounded-lg text-slate-500 hover:text-rose-400 flex items-center justify-center ml-1 cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Select Tender / Payment Channel:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: "ORANGE_MONEY", label: "Orange Money", icon: Smartphone, color: "text-orange-400" },
                          { id: "AFRIMONEY", label: "AfriMoney", icon: Smartphone, color: "text-blue-400" },
                          { id: "CASH", label: "Cash in Hand", icon: Wallet, color: "text-emerald-400" },
                          { id: "CARD", label: "Bank Card / POS", icon: CreditCard, color: "text-purple-400" },
                        ].map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.id as any)}
                            className={`p-2 rounded-xl text-left text-[11px] font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                              paymentMethod === method.id
                                ? "bg-indigo-600/30 border-indigo-500 text-white"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            <method.icon className={`h-3.5 w-3.5 shrink-0 ${method.color}`} />
                            <span className="truncate">{method.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtotal & GST Summary */}
                    <div className="space-y-1 pt-2 border-t border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal</span>
                        <span>Le {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>NRA GST (15%)</span>
                        <span>Le {gstTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-black text-sm text-amber-400 pt-1 border-t border-slate-800">
                        <span>Total Due</span>
                        <span>Le {total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Action Button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || isProcessing}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      "Processing Payment..."
                    ) : (
                      <>
                        <Receipt className="h-4 w-4" /> Complete Simulated Sale (Le {total.toLocaleString()})
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
