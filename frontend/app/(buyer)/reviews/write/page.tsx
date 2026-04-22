"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { StarRatingInput } from "@/components/StarRating";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";
import { AuthRequiredGuard } from "@/app/utils/RoleGuard";

interface Product {
  id: string;
  title: string;
  images: string[];
  price: number;
  seller: {
    id: string;
    business_name: string;
  };
}

function WriteReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const productId = searchParams.get("product");
  const orderId = searchParams.get("order");
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [canReviewReason, setCanReviewReason] = useState<string>("");
  
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [errors, setErrors] = useState<{ rating?: string; reviewText?: string }>({});

  useEffect(() => {
    if (productId && orderId) {
      loadProductAndCheckEligibility();
    } else {
      setLoading(false);
    }
  }, [productId, orderId]);

  const loadProductAndCheckEligibility = async () => {
    try {
      setLoading(true);
      
      // Load product details
      const productData = await api.get<Product>(`/api/products/${productId}`);
      setProduct(productData);
      
      // Check if user can review
      const canReviewData = await api.get<{
        can_review: boolean;
        reason?: string;
        message: string;
      }>(`/api/reviews/user/can-review?product_id=${productId}`);
      
      setCanReview(canReviewData.can_review);
      setCanReviewReason(canReviewData.message);
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { rating?: string; reviewText?: string } = {};
    
    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }
    
    if (reviewText.length > 500) {
      newErrors.reviewText = "Review text must be 500 characters or less";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!productId || !orderId) return;
    
    try {
      setSubmitting(true);
      
      await api.post("/api/reviews", {
        product_id: productId,
        order_id: orderId,
        rating,
        review_text: reviewText || null,
      });
      
      toast.success("Review submitted successfully!");
      router.push(`/product/${productId}`);
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!productId || !orderId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-semibold text-[#111827] mb-4">
          Missing Information
        </h1>
        <p className="text-[#6B7280] mb-6">
          Product or order information is missing. Please try again from your order page.
        </p>
        <Link href="/orders">
          <Button variant="secondary">Go to Orders</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-6">
          <div className="flex gap-4">
            <Skeleton className="w-20 h-20 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (canReview === false) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-semibold text-[#111827] mb-4">
          Cannot Review This Product
        </h1>
        <p className="text-[#6B7280] mb-6">{canReviewReason}</p>
        <Link href={`/product/${productId}`}>
          <Button variant="secondary">Back to Product</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Link */}
      <Link
        href={`/orders/${orderId}`}
        className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Order
      </Link>

      <h1 className="text-2xl font-semibold text-[#111827] mb-6">Write a Review</h1>

      {/* Product Info */}
      {product && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-6">
          <div className="flex gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E5E7EB] flex-shrink-0">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
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
            <div className="min-w-0">
              <h2 className="font-medium text-[#111827] line-clamp-2">
                {product.title}
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                By: {product.seller.business_name}
              </p>
              <p className="text-sm font-semibold text-[#111827] mt-1">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E5E7EB] rounded-xl p-6"
      >
        <div className="space-y-6">
          {/* Rating */}
          <StarRatingInput
            value={rating}
            onChange={setRating}
            error={errors.rating}
            label="Your Rating *"
          />

          {/* Review Text */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#111827]">
              Your Review (optional)
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={5}
              maxLength={500}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:border-black focus:outline-none resize-none"
            />
            <div className="flex justify-between text-sm">
              {errors.reviewText && (
                <span className="text-[#EF4444]">{errors.reviewText}</span>
              )}
              <span
                className={`ml-auto ${
                  reviewText.length > 500 ? "text-[#EF4444]" : "text-[#9CA3AF]"
                }`}
              >
                {reviewText.length}/500
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" isLoading={submitting}>
            Submit Review
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <AuthRequiredGuard>
      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-6">
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        }
      >
        <WriteReviewContent />
      </Suspense>
    </AuthRequiredGuard>
  );
}
