"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, Clock, Truck, CheckCircle, MapPin, CreditCard, ArrowLeft, PartyPopper, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { AuthRequiredGuard } from "@/app/utils/RoleGuard";

interface OrderItem {
  id: string;
  product_id: string;
  title: string;
  images: string[];
  quantity: number;
  price_at_order: number;
  subtotal: number;
  seller: {
    id: string;
    business_name: string;
  };
}

interface OrderDetail {
  id: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  total_amount: number;
  status: string;
  shipping_name: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_mobile: string;
  payment_method: string;
  payment_transaction_id: string | null;
  tracking_number: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export default function OrderDetailPage() {
  return (
    <AuthRequiredGuard>
      <OrderDetailContent />
    </AuthRequiredGuard>
  );
}

function OrderDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const isConfirmation = searchParams.get("confirmation") === "true";
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await api.get<OrderDetail>(`/api/orders/${orderId}`);
      setOrder(data);
    } catch (error) {
      console.error("Failed to load order:", error);
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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "shipped":
        return <Truck className="w-5 h-5" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
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

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "card":
        return "Credit/Debit Card";
      case "upi":
        return "UPI";
      case "wallet":
        return "Wallet";
      default:
        return method;
    }
  };

  const getExpectedDelivery = (orderDate: string) => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#6B7280]">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B7280]">Order not found</p>
        <Link href="/orders" className="text-black underline mt-4 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Confirmation Banner */}
      {isConfirmation && (
        <div className="bg-[#D1FAE5] border border-[#10B981] rounded-xl p-6 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="w-6 h-6 text-[#065F46]" />
            <h2 className="text-xl font-semibold text-[#065F46]">
              Order Placed Successfully!
            </h2>
          </div>
          <p className="text-[#065F46]">
            Thank you for your order. We&apos;ll keep you updated on the shipping progress.
          </p>
        </div>
      )}

      {/* Back Link */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#111827]">
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 self-start ${getStatusStyle(
              order.status
            )}`}
          >
            {getStatusIcon(order.status)}
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Status Timeline */}
        <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between max-w-md">
            {["pending", "shipped", "delivered"].map((status, idx) => {
              const isActive =
                ["pending", "shipped", "delivered"].indexOf(order.status) >= idx;
              return (
                <div key={status} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-[#E5E7EB] text-[#9CA3AF]"
                    }`}
                  >
                    {status === "pending" && <Clock className="w-4 h-4" />}
                    {status === "shipped" && <Truck className="w-4 h-4" />}
                    {status === "delivered" && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      isActive ? "text-[#111827]" : "text-[#9CA3AF]"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tracking Number */}
        {order.tracking_number && (
          <div className="mt-4 p-3 bg-[#F9FAFB] rounded-lg">
            <p className="text-sm text-[#6B7280]">
              Tracking Number:{" "}
              <span className="font-mono font-medium text-[#111827]">
                {order.tracking_number}
              </span>
            </p>
          </div>
        )}

        {/* Expected Delivery */}
        {order.status !== "delivered" && (
          <p className="text-sm text-[#6B7280] mt-4">
            Expected delivery: {getExpectedDelivery(order.created_at)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">
              Order Items
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-[#E5E7EB] last:border-0 last:pb-0"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E5E7EB] flex-shrink-0">
                    {item.images && item.images.length > 0 ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F3F4F6] flex items-center justify-center">
                        <Package className="w-6 h-6 text-[#9CA3AF]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product_id}`}
                      className="font-medium text-[#111827] hover:underline line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-[#6B7280] mt-1">
                      By: {item.seller.business_name}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      Qty: {item.quantity} × {formatPrice(item.price_at_order)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#111827]">
                      {formatPrice(item.subtotal)}
                    </p>
                    {order.status === "delivered" && (
                      <Link
                        href={`/reviews/write?product=${item.product_id}&order=${order.id}`}
                        className="text-sm text-black underline mt-2 inline-block"
                      >
                        Write Review
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="text-[#111827]">
                  {formatPrice(order.total_amount - 50)}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#6B7280]">Shipping</span>
                <span className="text-[#111827]">{formatPrice(50)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-[#E5E7EB]">
                <span className="text-[#111827]">Total</span>
                <span className="text-[#111827]">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#6B7280]" />
              <h3 className="font-semibold text-[#111827]">Shipping Address</h3>
            </div>
            <div className="text-sm text-[#6B7280]">
              <p className="font-medium text-[#111827]">{order.shipping_name}</p>
              <p>{order.shipping_address_line1}</p>
              {order.shipping_address_line2 && (
                <p>{order.shipping_address_line2}</p>
              )}
              <p>
                {order.shipping_city}, {order.shipping_state}{" "}
                {order.shipping_pincode}
              </p>
              <p className="mt-2">Phone: {order.shipping_mobile}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#6B7280]" />
              <h3 className="font-semibold text-[#111827]">Payment</h3>
            </div>
            <div className="text-sm text-[#6B7280]">
              <p className="font-medium text-[#111827]">
                {getPaymentMethodLabel(order.payment_method)}
              </p>
              {order.payment_transaction_id && (
                <p className="mt-2 font-mono text-xs">
                  Transaction: {order.payment_transaction_id}
                </p>
              )}
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="font-semibold text-[#111827] mb-2">Need Help?</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Contact our support team for any questions about your order.
            </p>
            <a
              href={`mailto:support@hive.com?subject=Help with Order ${order?.id?.slice(0, 8)}&body=Order ID: ${order?.id}%0A%0APlease describe your issue:%0A`}
              className="inline-flex items-center gap-2 text-sm font-medium text-black hover:underline"
            >
              <Mail className="w-4 h-4" />
              support@hive.com
            </a>
          </div>
        </div>
      </div>

      {/* Continue Shopping */}
      <div className="mt-8 text-center">
        <Link href="/home">
          <Button variant="secondary">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
