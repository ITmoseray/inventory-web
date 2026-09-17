"use client";

import React, { useState } from "react";
import { X, CheckCircle2, MessageCircle, ShoppingBag, Truck, MapPin, Phone, User, Mail, CreditCard, Clock } from "lucide-react";
import { useStoreCart } from "@/lib/store-builder/cart-store";
import { StoreTheme, StoreSettings } from "@/types/store-builder";
import { submitStorefrontOrder } from "@/lib/actions/store-builder";
import { toast } from "sonner";

interface Props {
  storeSlug: string;
  storeName: string;
  theme: StoreTheme;
  settings?: StoreSettings;
  currency?: string;
  whatsappPhone?: string;
}

export function StoreCheckoutModal({
  storeSlug,
  storeName,
  theme,
  settings,
  currency = "SLE",
  whatsappPhone,
}: Props) {
  const { items, isCheckoutOpen, setIsCheckoutOpen, getSubtotal, clearCart } = useStoreCart();

  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerWhatsApp: "",
    customerEmail: "",
    deliveryAddress: "",
    deliveryCity: "Freetown",
    deliveryMethod: "DELIVERY" as "DELIVERY" | "PICKUP",
    paymentMethod: "CASH_ON_DELIVERY" as "CASH_ON_DELIVERY" | "WHATSAPP" | "ONLINE",
    orderNotes: "",
  });

  if (!isCheckoutOpen) return null;

  const subtotal = getSubtotal();
  const deliveryFee = formData.deliveryMethod === "DELIVERY" ? (settings?.deliveryFee || 0) : 0;
  const totalAmount = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone) {
      toast.error("Please fill in your name and phone number");
      return;
    }
    if (formData.deliveryMethod === "DELIVERY" && !formData.deliveryAddress) {
      toast.error("Please provide your delivery address");
      return;
    }

    setLoading(true);
    try {
      const res = await submitStorefrontOrder(storeSlug, formData, items);
      if (res.success) {
        setSuccessOrder(res);
        clearCart();
        toast.success(`Order #${res.soNumber} placed successfully!`);
      } else {
        toast.error(res.error || "Failed to place order");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              {successOrder ? "Order Confirmed" : "Complete Your Order"}
            </h3>
            <p className="text-xs text-slate-400">
              {successOrder ? "Thank you for shopping with us!" : `Ordering from ${storeName}`}
            </p>
          </div>
          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setSuccessOrder(null);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Order Number</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                #{successOrder.soNumber}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto pt-1">
                Your order has been sent directly to {storeName}. Our sales team will verify and prepare your order promptly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Total Payable</span>
                <span className="text-slate-900 dark:text-white font-black">
                  {currency} {successOrder.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-medium text-[11px] text-slate-400">
                <span>Payment Mode</span>
                <span>{formData.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Mobile / Online"}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              {successOrder.whatsappUrl && (
                <a
                  href={successOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Send Confirmation on WhatsApp
                </a>
              )}

              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setSuccessOrder(null);
                }}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Customer Details */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" /> Customer Information
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mariatu Sesay"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+232 79 123456"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">WhatsApp Line (Optional)</label>
                  <input
                    type="tel"
                    placeholder="Same as phone if blank"
                    value={formData.customerWhatsApp}
                    onChange={(e) => setFormData({ ...formData, customerWhatsApp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-slate-950 font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-slate-950 font-medium focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-500" /> Delivery Method
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, deliveryMethod: "DELIVERY" })}
                  className={`p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                    formData.deliveryMethod === "DELIVERY"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600"
                      : "border-slate-200 dark:border-slate-800 text-slate-600"
                  }`}
                >
                  <div>Doorstep Delivery</div>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {deliveryFee > 0 ? `+${currency} ${deliveryFee.toLocaleString()}` : "Free"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, deliveryMethod: "PICKUP" })}
                  className={`p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                    formData.deliveryMethod === "PICKUP"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600"
                      : "border-slate-200 dark:border-slate-800 text-slate-600"
                  }`}
                >
                  <div>Store Pickup</div>
                  <span className="text-[10px] text-slate-400 font-normal">Free pickup</span>
                </button>
              </div>

              {formData.deliveryMethod === "DELIVERY" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Delivery Address / Landmark *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Street name, building, nearby junction, Freetown"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs bg-white dark:bg-slate-950 font-medium focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Payment Selection
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: "CASH_ON_DELIVERY" })}
                  className={`p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                    formData.paymentMethod === "CASH_ON_DELIVERY"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600"
                      : "border-slate-200 dark:border-slate-800 text-slate-600"
                  }`}
                >
                  <div>Cash on Delivery</div>
                  <span className="text-[10px] text-slate-400 font-normal">Pay when you receive</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: "WHATSAPP" })}
                  className={`p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                    formData.paymentMethod === "WHATSAPP"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600"
                      : "border-slate-200 dark:border-slate-800 text-slate-600"
                  }`}
                >
                  <div>WhatsApp Order</div>
                  <span className="text-[10px] text-slate-400 font-normal">Confirm directly with shop</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Order Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Special instructions or delivery timing..."
                  value={formData.orderNotes}
                  onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border text-xs bg-white dark:bg-slate-950 font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Order Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Items ({items.length})</span>
                <span>{currency} {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Delivery</span>
                <span>{deliveryFee > 0 ? `${currency} ${deliveryFee.toLocaleString()}` : "FREE"}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                <span>Total Due</span>
                <span style={{ color: theme.colors.primary }}>
                  {currency} {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                `Confirm & Place Order (${currency} ${totalAmount.toLocaleString()})`
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
