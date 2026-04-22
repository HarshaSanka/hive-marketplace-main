import { ReactNode } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Search,
  FileText,
  ShoppingBag,
  Star,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#111827] mb-2">{title}</h3>
      <p className="text-[#6B7280] max-w-sm mb-6">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Link href={actionHref}>
            <Button>{actionLabel}</Button>
          </Link>
        ) : (
          <Button onClick={onAction}>{actionLabel}</Button>
        )
      )}
    </div>
  );
}

// Pre-configured empty states for common use cases
export function EmptyCart() {
  return (
    <EmptyState
      icon={<ShoppingCart className="w-8 h-8 text-[#9CA3AF]" />}
      title="Your cart is empty"
      description="Start shopping to fill it up. Browse our collection and find something you'll love!"
      actionLabel="Start Shopping"
      actionHref="/home"
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={<Package className="w-8 h-8 text-[#9CA3AF]" />}
      title="No orders yet"
      description="When you place an order, it'll appear here. Ready to start shopping?"
      actionLabel="Browse Products"
      actionHref="/home"
    />
  );
}

export function EmptySearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8 text-[#9CA3AF]" />}
      title="No products found"
      description={
        query
          ? `We couldn't find any products matching "${query}". Try adjusting your search or filters.`
          : "Try adjusting your filters or search for something else."
      }
    />
  );
}

export function EmptyProducts() {
  return (
    <EmptyState
      icon={<ShoppingBag className="w-8 h-8 text-[#9CA3AF]" />}
      title="No products yet"
      description="You haven't added any products. Start by creating your first product listing!"
      actionLabel="Add Product"
      actionHref="/seller/products/new"
    />
  );
}

export function EmptySellerOrders() {
  return (
    <EmptyState
      icon={<FileText className="w-8 h-8 text-[#9CA3AF]" />}
      title="No orders yet"
      description="When customers place orders for your products, they'll appear here."
    />
  );
}

export function EmptyReviews() {
  return (
    <EmptyState
      icon={<Star className="w-8 h-8 text-[#9CA3AF]" />}
      title="No reviews yet"
      description="Be the first to review this product!"
    />
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-8 h-8 text-[#EF4444]" />}
      title={title}
      description={description}
      actionLabel={onRetry ? "Try Again" : undefined}
      onAction={onRetry}
    />
  );
}
