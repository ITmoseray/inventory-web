"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types/store-builder";

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  storeSlug: string;
  setStoreSlug: (slug: string) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useStoreCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      isCheckoutOpen: false,
      storeSlug: "",
      setStoreSlug: (slug: string) => {
        if (get().storeSlug !== slug) {
          set({ storeSlug: slug });
        }
      },
      setIsCartOpen: (open: boolean) => set({ isCartOpen: open }),
      setIsCheckoutOpen: (open: boolean) => set({ isCheckoutOpen: open }),
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.productId === item.productId);
          if (existingIndex > -1) {
            const updated = [...state.items];
            const newQty = Math.min(updated[existingIndex].quantity + quantity, item.maxStock || 999);
            updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
            return { items: updated, isCartOpen: true };
          } else {
            return {
              items: [...state.items, { ...item, quantity: Math.min(quantity, item.maxStock || 999) }],
              isCartOpen: true
            };
          }
        });
      },
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId)
        }));
      },
      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.min(quantity, i.maxStock || 999) }
                : i
            )
          };
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
    }),
    {
      name: "protech-storefront-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, storeSlug: state.storeSlug })
    }
  )
);
