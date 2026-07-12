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


interface POSState {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  grandTotal: number;
  currentDraftId: string | null;
  setDraftId: (id: string | null) => void;
  setCart: (items: CartItem[]) => void;
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  total: 0,
  grandTotal: 0,
  currentDraftId: null,
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
  clearCart: () => set({ cart: [], total: 0, grandTotal: 0, currentDraftId: null }),
  setDraftId: (id) => set({ currentDraftId: id }),
  setCart: (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    set({ cart: items, total, grandTotal: total });
  }
}));
