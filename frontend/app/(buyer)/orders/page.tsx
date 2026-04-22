"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, Truck, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { OrderListSkeleton } from "@/components/Skeleton";
import { EmptyOrders } from "@/components/EmptyState";
import { AuthRequiredGuard } from "@/app/utils/RoleGuard";

interface OrderSummary {
  id: string;
  total_amount: number;
  status: string;
  items_count: number;
  created_at: string;
}

interface OrdersResponse {
  orders: OrderSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function OrdersPage() {
  return (
    <AuthRequiredGuard>
      <OrdersContent />
    </AuthRequiredGuard>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

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
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-[#F3F4F6] rounded mb-6 animate-shimmer" />
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-[#F3F4F6] rounded-lg animate-shimmer" />
          ))}
        </div>
        <OrderListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#111827] mb-6">Your Orders</h1>

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
          <EmptyOrders />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white border border-[#E5E7EB] rounded-xl p-6 hover:border-black transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
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
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#111827]">
                    {formatPrice(order.total_amount)}
                  </p>
                  <p className="text-sm text-[#6B7280]">View Details →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
