"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/Toast";
import { CartItemSkeleton } from "@/components/Skeleton";
import { EmptyCart } from "@/components/EmptyState";
import { AuthRequiredGuard } from "@/app/utils/RoleGuard";

interface CartItemData {
  id: string;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    stock_quantity: number;
    seller: {
      id: string;
      business_name: string;
    };
  };
  quantity: number;
  subtotal: number;
}

interface CartData {
  id: string;
  items: CartItemData[];
  total_items: number;
  total_amount: number;
}

const SHIPPING_COST = 50;

export default function CartPage() {
  return (
    <AuthRequiredGuard>
      <CartContent />
    </AuthRequiredGuard>
  );
}

function CartContent() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { setCart: setStoreCart } = useCartStore();
  const toast = useToast();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await api.get<CartData>("/api/cart");
      setCart(data);
      // Sync with store
      setStoreCart(data.items.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          images: item.product.images,
          stock_quantity: item.product.stock_quantity,
        },
        quantity: item.quantity,
        subtotal: item.subtotal,
      })));
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(itemId);
      await api.put(`/api/cart/items/${itemId}`, { quantity: newQuantity });
      await loadCart();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setUpdating(itemId);
      await api.delete(`/api/cart/items/${itemId}`);
      await loadCart();
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-[#F3F4F6] rounded mb-6 animate-shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <CartItemSkeleton />
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
              <div className="h-6 w-32 bg-[#F3F4F6] rounded animate-shimmer" />
              <div className="h-4 w-full bg-[#F3F4F6] rounded animate-shimmer" />
              <div className="h-4 w-full bg-[#F3F4F6] rounded animate-shimmer" />
              <div className="h-12 w-full bg-[#F3F4F6] rounded animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  const subtotal = cart.total_amount;
  const total = subtotal + SHIPPING_COST;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#111827] mb-6">
        Shopping Cart ({cart.total_items} {cart.total_items === 1 ? "item" : "items"})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex gap-4"
            >
              {/* Product Image */}
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-[#E5E7EB]">
                {item.product.images && item.product.images.length > 0 ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-[#F3F4F6] flex items-center justify-center">
                    <span className="text-xs text-[#9CA3AF]">No image</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.product.id}`}
                  className="font-medium text-[#111827] hover:underline line-clamp-2"
                >
                  {item.product.title}
                </Link>
                <p className="text-sm text-[#6B7280] mt-1">
                  By: {item.product.seller.business_name}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border border-[#E5E7EB] rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating === item.id}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[#F3F4F6] rounded-l-lg disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={
                        item.quantity >= item.product.stock_quantity ||
                        updating === item.id
                      }
                      className="w-8 h-8 flex items-center justify-center hover:bg-[#F3F4F6] rounded-r-lg disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={updating === item.id}
                    className="text-[#EF4444] hover:text-[#DC2626] text-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>

                {/* Stock warning */}
                {item.product.stock_quantity <= 5 && (
                  <p className="text-xs text-[#F59E0B] mt-2">
                    Only {item.product.stock_quantity} left in stock
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="font-semibold text-[#111827]">
                  {formatPrice(item.subtotal)}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {formatPrice(item.product.price)} each
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="text-[#111827]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Shipping</span>
                <span className="text-[#111827]">{formatPrice(SHIPPING_COST)}</span>
              </div>
              <div className="border-t border-[#E5E7EB] pt-3 mt-3">
                <div className="flex justify-between font-semibold text-base">
                  <span className="text-[#111827]">Total</span>
                  <span className="text-[#111827]">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <Link href="/checkout" className="block mt-6">
              <Button className="w-full flex items-center justify-center gap-2">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/home" className="block mt-3">
              <Button variant="secondary" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
