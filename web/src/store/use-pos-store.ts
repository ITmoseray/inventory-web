import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isExternal?: boolean;
  externalSourceName?: string;
  externalCostPrice?: number;
  unitId?: string; // Extension for unit conversion
  ratio?: number; // Extension for unit conversion
  requiresPrescription?: boolean;
}

export interface HeldCart {
  id: string;
  name: string;
  timestamp: number;
  items: CartItem[];
  total: number;
}

interface POSState {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  grandTotal: number;
  heldCarts: HeldCart[];
  holdCart: (name: string) => void;
  restoreCart: (id: string) => void;
  removeHeldCart: (id: string) => void;
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  total: 0,
  grandTotal: 0,
  heldCarts: [],
  addItem: (item) => {
    const { cart } = get();
    const existingItem = cart.find((i) => i.id === item.id);
    let newCart;
    if (existingItem) {
      newCart = cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
    } else {
      newCart = [...cart, { ...item }];
    }
    const total = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    set({ 
        cart: newCart,
        total,
        grandTotal: total
    });
  },
  removeItem: (id) => {
    const newCart = get().cart.filter((i) => i.id !== id);
    const total = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    set({ 
        cart: newCart,
        total,
        grandTotal: total
    });
  },
  updateQuantity: (id, quantity) => {
    let newCart;
    if (quantity <= 0) {
      newCart = get().cart.filter((i) => i.id !== id);
    } else {
      newCart = get().cart.map((i) => (i.id === id ? { ...i, quantity } : i));
    }
    const total = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    set({
        cart: newCart,
        total,
        grandTotal: total
    });
  },
  clearCart: () => set({ cart: [], total: 0, grandTotal: 0 }),
  holdCart: (name: string) => {
    const { cart, total, heldCarts } = get();
    if (cart.length === 0) return;
    
    const newHeldCart: HeldCart = {
      id: Math.random().toString(36).substring(7),
      name: name || `Cart ${heldCarts.length + 1}`,
      timestamp: Date.now(),
      items: [...cart],
      total
    };
    
    set({
      heldCarts: [...heldCarts, newHeldCart],
      cart: [],
      total: 0,
      grandTotal: 0
    });
  },
  restoreCart: (id: string) => {
    const { heldCarts } = get();
    const cartToRestore = heldCarts.find(hc => hc.id === id);
    if (!cartToRestore) return;
    
    set({
      cart: [...cartToRestore.items],
      total: cartToRestore.total,
      grandTotal: cartToRestore.total,
      heldCarts: heldCarts.filter(hc => hc.id !== id)
    });
  },
  removeHeldCart: (id: string) => {
    const { heldCarts } = get();
    set({
      heldCarts: heldCarts.filter(hc => hc.id !== id)
    });
  }
}));
