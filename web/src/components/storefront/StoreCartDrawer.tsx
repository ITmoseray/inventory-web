"use client";

import React from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useStoreCart } from "@/lib/store-builder/cart-store";
import { StoreTheme, StoreSettings } from "@/types/store-builder";

interface Props {
  theme: StoreTheme;
  settings?: StoreSettings;
  currency?: string;
  storeSlug: string;
}

export function StoreCartDrawer({ theme, settings, currency = "SLE", storeSlug }: Props) {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    setIsCheckoutOpen,
    removeItem, 
    updateQuantity, 
    getSubtotal, 
    getTotalItems 
  } = useStoreCart();

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 0;
  const progressToFree = freeDeliveryThreshold > 0 ? Math.min(100, (subtotal / freeDeliveryThreshold) * 100) : 100;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div 
        className="absolute inset-y-0 right-0 max-w-full w-full sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: theme.colors.primary }} />
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              Shopping Cart ({totalItems})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        {freeDeliveryThreshold > 0 && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 text-xs">
            {subtotal >= freeDeliveryThreshold ? (
              <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> You've unlocked FREE delivery!
              </span>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>Add {currency} {(freeDeliveryThreshold - subtotal).toLocaleString()} for free delivery</span>
                  <span>{Math.round(progressToFree)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressToFree}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto stroke-[1.5]" />
              <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Your cart is empty</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Discover our products and add items to begin your order.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center gap-3.5"
              >
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                  <div className="font-black text-xs" style={{ color: theme.colors.primary }}>
                    {currency} {item.price.toLocaleString()}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-l-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-r-lg"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-black text-lg text-slate-900 dark:text-white">
                {currency} {subtotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: theme.colors.primary }}
            >
              Checkout Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
