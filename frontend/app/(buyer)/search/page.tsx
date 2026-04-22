"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
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

const CATEGORIES = ["Electronics", "Fashion", "Home", "Beauty", "Food", "Handmade", "Other"];

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="flex gap-8">
      <aside className="w-60 flex-shrink-0">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 h-96 animate-pulse" />
      </aside>
      <div className="flex-1">
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [rating, setRating] = useState<number | null>(null);
  const [sort, setSort] = useState("relevance");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategories, minPrice, maxPrice, rating, sort]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategories.length > 0) {
        selectedCategories.forEach((cat) => params.append("category", cat));
      }
      if (minPrice > 0) params.append("min_price", minPrice.toString());
      if (maxPrice < 50000) params.append("max_price", maxPrice.toString());
      if (rating) params.append("rating", rating.toString());
      params.append("sort", sort);
      params.append("page", "1");
      params.append("limit", "20");

      const response = await api.get<{
        products: Product[];
        total: number;
      }>(`/api/products?${params.toString()}`);

      setProducts(response.products);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(50000);
    setRating(null);
    setSort("relevance");
  };

  return (
    <div className="flex gap-8">
      {/* Sidebar Filters */}
      <aside className="w-60 flex-shrink-0">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sticky top-24">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Category</h3>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="w-4 h-4 border-[#E5E7EB] rounded"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Price Range</h3>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#6B7280]">
                <span>₹0</span>
                <span>₹{maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Rating</h3>
            <div className="space-y-2">
              {[null, 4, 3].map((r) => (
                <label key={r || "all"} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="rating"
                    checked={rating === r}
                    onChange={() => setRating(r)}
                    className="w-4 h-4"
                  />
                  <span>{r ? `${r}+ stars` : "All"}</span>
                </label>
              ))}
            </div>
          </div>

          <Button variant="secondary" onClick={clearFilters} className="w-full">
            Clear All
          </Button>
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            {total > 0 ? `${total} Results` : "No Results"}
          </h1>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 px-4 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-black"
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : products.length === 0 ? (
          <EmptySearchResults query={search} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
