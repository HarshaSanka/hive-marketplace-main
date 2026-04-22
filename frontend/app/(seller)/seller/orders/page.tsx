"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, Truck, CheckCircle, Eye, Send } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { OrderListSkeleton } from "@/components/Skeleton";
import { EmptySellerOrders } from "@/components/EmptyState";

interface OrderSummary {
  id: string;
  total_amount: number;
  status: string;
  items_count: number;
  created_at: string;
  buyer?: {
    name: string;
    email: string;
  };
}

interface OrdersResponse {
  orders: OrderSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [shipping, setShipping] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const data = await api.get<OrdersResponse>(`/api/orders${params}`);
      setOrders(data.orders);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsShipped = async (orderId: string) => {
    try {
      setShipping(orderId);
      await api.put(`/api/orders/${orderId}/ship`);
      await loadOrders();
      toast.success("Order marked as shipped! Customer has been notified.");
    } catch (error) {
      console.error("Failed to ship order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to ship order");
    } finally {
      setShipping(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-[#FEF3C7] text-[#92400E]";
      case "shipped":
        return "bg-[#DBEAFE] text-[#1E40AF]";
      case "delivered":
        return "bg-[#D1FAE5] text-[#065F46]";
      default:
        return "bg-[#F3F4F6] text-[#6B7280]";
    }
  };

  if (loading) {
    return (
      <div>
        <div className="h-8 w-32 bg-[#F3F4F6] rounded mb-6 animate-shimmer" />
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-[#F3F4F6] rounded-lg animate-shimmer" />
          ))}
        </div>
        <OrderListSkeleton count={5} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#111827] mb-6">Orders</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { value: "", label: "All Orders" },
          { value: "pending", label: "Pending" },
          { value: "shipped", label: "Shipped" },
          { value: "delivered", label: "Delivered" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              statusFilter === filter.value
                ? "bg-black text-white"
                : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl">
          <EmptySellerOrders />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-[#E5E7EB] rounded-xl p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-medium text-[#111827]">
                      Order #{order.id.slice(0, 8)}
                    </h2>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B7280]">
                    {formatDate(order.created_at)} • {order.items_count}{" "}
                    {order.items_count === 1 ? "item" : "items"}
                  </p>
                  {order.buyer && (
                    <p className="text-sm text-[#6B7280] mt-1">
                      Customer: <span className="text-[#111827]">{order.buyer.name}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <p className="font-semibold text-[#111827]">
                    {formatPrice(order.total_amount)}
                  </p>

                  <div className="flex gap-2">
                    <Link href={`/seller/orders/${order.id}`}>
                      <Button variant="secondary" className="gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>

                    {order.status === "pending" && (
                      <Button
                        onClick={() => handleMarkAsShipped(order.id)}
                        isLoading={shipping === order.id}
                        className="gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Ship
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
