import { create } from "zustand";

export interface WishlistItem {
  id: string;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    stock_quantity: number;
  };
  added_at: string;
}

interface WishlistState {
  items: WishlistItem[];
  setWishlist: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (itemId: string) => void;
  hasProduct: (productId: string) => boolean;
  getItemIdByProductId: (productId: string) => string | null;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  setWishlist: (items) => set({ items }),
  addItem: (item) =>
    set((state) => {
      if (state.items.some((i) => i.product.id === item.product.id)) return state;
      return { items: [item, ...state.items] };
    }),
  removeItem: (itemId) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),
  hasProduct: (productId) => get().items.some((i) => i.product.id === productId),
  getItemIdByProductId: (productId) => {
    const found = get().items.find((i) => i.product.id === productId);
    return found ? found.id : null;
  },
}));
