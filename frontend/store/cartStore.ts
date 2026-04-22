import { create } from "zustand";

export interface CartItem {
  id: string;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    stock_quantity: number;
  };
  quantity: number;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setCart: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalItems: 0,
  totalAmount: 0,
  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.product.id === item.product.id);
      if (existingItem) {
        const updatedItems = state.items.map((i) =>
          i.product.id === item.product.id
            ? { ...i, quantity: i.quantity + item.quantity, subtotal: (i.quantity + item.quantity) * i.product.price }
            : i
        );
        const totalItems = updatedItems.reduce((sum, i) => sum + i.quantity, 0);
        const totalAmount = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
        return { items: updatedItems, totalItems, totalAmount };
      }
      const updatedItems = [...state.items, item];
      const totalItems = updatedItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalAmount = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
      return { items: updatedItems, totalItems, totalAmount };
    });
  },
  updateQuantity: (itemId, quantity) => {
    set((state) => {
      const updatedItems = state.items.map((i) =>
        i.id === itemId ? { ...i, quantity, subtotal: quantity * i.product.price } : i
      );
      const totalItems = updatedItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalAmount = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
      return { items: updatedItems, totalItems, totalAmount };
    });
  },
  removeItem: (itemId) => {
    set((state) => {
      const updatedItems = state.items.filter((i) => i.id !== itemId);
      const totalItems = updatedItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalAmount = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
      return { items: updatedItems, totalItems, totalAmount };
    });
  },
  clearCart: () => {
    set({ items: [], totalItems: 0, totalAmount: 0 });
  },
  setCart: (items) => {
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);
    set({ items, totalItems, totalAmount });
  },
}));
