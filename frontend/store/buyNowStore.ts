import { create } from "zustand";

export interface BuyNowItem {
  productId: string;
  title: string;
  price: number;
  images: string[];
  quantity: number;
  seller: {
    id: string;
    business_name: string;
  };
}

interface BuyNowState {
  item: BuyNowItem | null;
  setItem: (item: BuyNowItem) => void;
  clearItem: () => void;
}

export const useBuyNowStore = create<BuyNowState>((set) => ({
  item: null,
  setItem: (item) => set({ item }),
  clearItem: () => set({ item: null }),
}));
