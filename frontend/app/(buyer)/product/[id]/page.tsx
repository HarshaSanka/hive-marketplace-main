"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Zap, Heart } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { useBuyNowStore } from "@/store/buyNowStore";
import { useToast } from "@/components/Toast";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { StarRating } from "@/components/StarRating";
import { ReviewCard, RatingDistribution } from "@/components/ReviewCard";
import { ProductDetailSkeleton, ReviewListSkeleton } from "@/components/Skeleton";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  images: string[];
  average_rating?: number;
  total_reviews?: number;
  seller: {
    id: string;
    business_name: string;
  };
}

interface Review {
  id: string;
  user: {
    name: string;
  };
  rating: number;
  review_text: string | null;
  created_at: string;
}

interface ReviewsData {
  reviews: Review[];
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<string, number>;
}

interface WishlistItemData {
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

interface WishlistData {
  id: string;
  items: WishlistItemData[];
  total_items: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const toast = useToast();
  const { isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const { setItem: setBuyNowItem } = useBuyNowStore();
  const { hasProduct, setWishlist, addItem: addWishlistItem } = useWishlistStore();
  
  // Reviews state
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    loadProduct();
    loadReviews();
    loadWishlistIfAuthed();
  }, [productId, isAuthenticated]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await api.get<Product>(`/api/products/${productId}`);
      setProduct(data);
      if (data.images && data.images.length > 0) {
        setSelectedImage(0);
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await api.get<ReviewsData>(`/api/reviews/product/${productId}?limit=10`);
      setReviewsData(data);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadWishlistIfAuthed = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.get<WishlistData>("/api/wishlist");
      const items = (data.items || []).map((item) => ({
        id: item.id,
        product: {
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          images: item.product.images || [],
          stock_quantity: item.product.stock_quantity,
        },
        added_at: item.added_at,
      }));
      setWishlist(items);
    } catch (error) {
      // Non-blocking; wishlist is optional on this page.
      console.error("Failed to load wishlist:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      await api.post("/api/cart/items", {
        product_id: product.id,
        quantity,
      });
      
      // Sync cart from API to update count in header
      const cartData = await api.get<{ items: any[] }>("/api/cart");
      const cartItems = cartData.items.map((item: any) => ({
        id: item.id,
        product: {
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          images: item.product.images || [],
          stock_quantity: item.product.stock_quantity,
        },
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));
      
      // Update store with API data
      const { setCart } = useCartStore.getState();
      setCart(cartItems);
      
      toast.success("Product added to cart!");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    const wasInWishlist = hasProduct(product.id);
    if (wasInWishlist) {
      toast.success("Already in wishlist");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to add to wishlist");
      router.push(`/login?redirect=${encodeURIComponent(`/product/${product.id}`)}`);
      return;
    }

    try {
      setAddingToWishlist(true);
      const item = await api.post<WishlistItemData>("/api/wishlist/items", {
        product_id: product.id,
      });

      addWishlistItem({
        id: item.id,
        product: {
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          images: item.product.images || [],
          stock_quantity: item.product.stock_quantity,
        },
        added_at: item.added_at,
      });

      toast.success("Added to wishlist!");
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add to wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    setBuyingNow(true);
    
    // Set buy now item in store
    setBuyNowItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      images: product.images || [],
      quantity,
      seller: product.seller,
    });
    
    // Navigate to checkout
    router.push("/checkout");
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="text-center py-12 text-[#6B7280]">
        Product not found
      </div>
    );
  }

  const displayPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price);

  const stockStatus =
    product.stock_quantity > 5
      ? "available"
      : product.stock_quantity > 0
      ? "low"
      : "out";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div>
          <div className="relative w-full aspect-square mb-4 border border-[#E5E7EB] rounded-xl overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="500px"
              />
            ) : (
              <div className="w-full h-full bg-[#F3F4F6] flex items-center justify-center">
                <span className="text-[#9CA3AF]">No image</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 border-2 rounded-lg overflow-hidden ${
                    selectedImage === idx
                      ? "border-black"
                      : "border-[#E5E7EB]"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-semibold mb-4">{product.title}</h1>
          <p className="text-3xl font-bold mb-4">{displayPrice}</p>

          {reviewsData && reviewsData.total_reviews > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={reviewsData.average_rating} size="md" showValue />
              <Link 
                href="#reviews" 
                className="text-[#6B7280] hover:underline"
              >
                ({reviewsData.total_reviews} review{reviewsData.total_reviews !== 1 ? "s" : ""})
              </Link>
            </div>
          )}

          <p className="text-[#6B7280] mb-4">
            By: <span className="text-[#111827] font-medium">{product.seller.business_name}</span>
          </p>
          <p className="text-[#6B7280] mb-4">Category: {product.category}</p>

          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Stock:</p>
            <span
              className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${
                stockStatus === "available"
                  ? "bg-[#D1FAE5] text-[#065F46]"
                  : stockStatus === "low"
                  ? "bg-[#FEF3C7] text-[#92400E]"
                  : "bg-[#FEE2E2] text-[#991B1B]"
              }`}
            >
              {stockStatus === "available"
                ? `${product.stock_quantity} available`
                : stockStatus === "low"
                ? `Only ${product.stock_quantity} left`
                : "Out of stock"}
            </span>
          </div>

          {product.stock_quantity > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6]"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))
                  }
                  className="w-20 h-10 text-center border border-[#E5E7EB] rounded-lg"
                  min={1}
                  max={product.stock_quantity}
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock_quantity, quantity + 1))
                  }
                  className="w-10 h-10 border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6]"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0 || addingToCart || buyingNow}
              isLoading={addingToCart}
              variant="secondary"
              className="flex-1"
            >
              {!addingToCart && <ShoppingCart className="w-5 h-5 mr-2" />}
              Add to Cart
            </Button>
            <Button
              onClick={handleAddToWishlist}
              disabled={addingToCart || buyingNow || addingToWishlist || hasProduct(product.id)}
              isLoading={addingToWishlist}
              variant="secondary"
              className="flex-1"
            >
              {!addingToWishlist && <Heart className="w-5 h-5 mr-2" />}
              {hasProduct(product.id) ? "In Wishlist" : "Add to Wishlist"}
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={product.stock_quantity === 0 || addingToCart || buyingNow}
              isLoading={buyingNow}
              className="flex-1"
            >
              {!buyingNow && <Zap className="w-5 h-5 mr-2" />}
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <p className="text-[#6B7280] whitespace-pre-line">{product.description}</p>
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="scroll-mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Reviews {reviewsData && reviewsData.total_reviews > 0 && `(${reviewsData.total_reviews})`}
          </h2>
        </div>

        {reviewsLoading ? (
          <ReviewListSkeleton count={3} />
        ) : reviewsData && reviewsData.total_reviews > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#F9FAFB] rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-[#111827]">
                    {reviewsData.average_rating.toFixed(1)}
                  </div>
                  <StarRating 
                    rating={reviewsData.average_rating} 
                    size="lg" 
                    className="justify-center mt-2"
                  />
                  <div className="text-sm text-[#6B7280] mt-2">
                    {reviewsData.total_reviews} review{reviewsData.total_reviews !== 1 ? "s" : ""}
                  </div>
                </div>
                <RatingDistribution
                  distribution={reviewsData.rating_distribution}
                  totalReviews={reviewsData.total_reviews}
                />
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {(showAllReviews 
                  ? reviewsData.reviews 
                  : reviewsData.reviews.slice(0, 5)
                ).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {reviewsData.reviews.length > 5 && !showAllReviews && (
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="mt-4 text-black underline hover:text-[#4B5563]"
                >
                  View all {reviewsData.total_reviews} reviews
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-[#F9FAFB] rounded-xl">
            <p className="text-[#6B7280]">No reviews yet</p>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Be the first to review this product!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
