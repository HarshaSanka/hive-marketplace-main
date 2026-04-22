"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Truck, CheckCircle, Package, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { DashboardStatsSkeleton, Skeleton } from "@/components/Skeleton";

interface Stats {
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  low_stock_products: number;
}

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

export default function SellerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData] = await Promise.all([
        api.get<Stats>("/api/seller/stats"),
        api.get<{ orders: OrderSummary[] }>("/api/orders?limit=5"),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.orders);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-32 mb-6" />
        <DashboardStatsSkeleton />
        <div className="mt-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-6 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B7280]">Failed to load dashboard. Please try again.</p>
        <Button onClick={loadData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <h3 className="text-sm font-medium text-[#6B7280] mb-2">Total Products</h3>
          <p className="text-3xl font-bold">{stats.total_products}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-[#6B7280] mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">{stats.total_orders}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-[#6B7280] mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">{formatCurrency(stats.total_revenue)}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-[#6B7280] mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold">{stats.pending_orders}</p>
        </Card>
      </div>

      {stats.low_stock_products > 0 && (
        <Card className="mb-8 border-[#F59E0B]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-[#92400E]">Low Stock Alert</h3>
              <p className="text-sm text-[#6B7280]">
                {stats.low_stock_products} product{stats.low_stock_products > 1 ? "s" : ""} with
                low stock
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/seller/orders">
            <Button variant="text" className="gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <p className="text-[#6B7280] text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/seller/orders/${order.id}`}
                className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-lg hover:border-black transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                  </span>
                  <div>
                    <p className="font-medium text-sm">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {order.buyer?.name || "Customer"} • {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <p className="font-medium">{formatCurrency(order.total_amount)}</p>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
