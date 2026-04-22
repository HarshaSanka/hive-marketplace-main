"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";
import { EmptyProducts } from "@/components/EmptyState";

interface Product {
  id: string;
  title: string;
  price: number;
  stock_quantity: number;
  status: string;
  images: string[];
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Fetch only products belonging to the current seller
      const response = await api.get<{ products: Product[] }>("/api/seller/products");
      setProducts(response.products);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      setDeleting(true);
      await api.delete(`/api/products/${productId}`);
      setProducts(products.filter((p) => p.id !== productId));
      setDeleteModalOpen(false);
      setProductToDelete(null);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-11 w-36" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="w-8 h-8 rounded" />
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="relative group">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
          <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <Link
              href="/seller/products/new"
              className="block px-4 py-2 text-sm hover:bg-[#F3F4F6] rounded"
            >
              Single Upload
            </Link>
            <Link
              href="/seller/products/bulk"
              className="block px-4 py-2 text-sm hover:bg-[#F3F4F6] rounded"
            >
              Bulk CSV
            </Link>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <Card>
          <EmptyProducts />
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id}>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 border border-[#E5E7EB] rounded-lg overflow-hidden flex-shrink-0">
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
                      <span className="text-xs text-[#9CA3AF]">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{product.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                    <span>₹{product.price.toLocaleString()}</span>
                    <span>Stock: {product.stock_quantity}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        product.status === "active"
                          ? "bg-[#D1FAE5] text-[#065F46]"
                          : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {product.status}
                    </span>
                    {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                      <span className="px-2 py-1 rounded text-xs bg-[#FEF3C7] text-[#92400E]">
                        ⚠️ Low Stock
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/seller/products/${product.id}`}>
                    <button className="p-2 hover:bg-[#F3F4F6] rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      setProductToDelete(product.id);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 hover:bg-[#FEE2E2] rounded-lg text-[#EF4444]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        title="Delete Product"
      >
        <p className="mb-4 text-[#6B7280]">
          Are you sure you want to delete this product? This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteModalOpen(false);
              setProductToDelete(null);
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => productToDelete && handleDelete(productToDelete)}
            className="bg-[#EF4444] hover:bg-[#DC2626]"
            isLoading={deleting}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
