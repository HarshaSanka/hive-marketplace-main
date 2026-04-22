"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import { ProductGridSkeleton } from "@/components/Skeleton";
import { EmptySearchResults } from "@/components/EmptyState";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  average_rating?: number;
  total_reviews?: number;
}

export default function TrendingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get<{
        products: Product[];
        total: number;
        page: number;
        limit: number;
        total_pages: number;
      }>(`/api/products/trending?page=${page}&limit=20`);

      if (page === 1) {
        setProducts(response.products);
      } else {
        setProducts((prev) => [...prev, ...response.products]);
      }
      setHasMore(response.page < response.total_pages);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">Trending</h1>
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Trending</h1>
      {products.length === 0 ? (
        <EmptySearchResults />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
