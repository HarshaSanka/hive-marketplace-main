"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Upload, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Skeleton } from "@/components/Skeleton";

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Food",
  "Handmade",
  "Other",
];

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  status: string;
  images: string[];
}

interface ProductForm {
  title: string;
  description: string;
  price: string;
  category: string;
  stock_quantity: string;
  status: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>();

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await api.get<Product>(`/api/products/${params.id}`);
      setProduct(data);
      setExistingImages(data.images || []);
      reset({
        title: data.title,
        description: data.description || "",
        price: data.price.toString(),
        category: data.category,
        stock_quantity: data.stock_quantity.toString(),
        status: data.status,
      });
    } catch (error) {
      toast.error("Failed to load product");
      router.push("/seller/products");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length;
    const remainingSlots = 4 - totalImages;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.error(`You can only have up to 4 images total.`);
    }

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setNewImages((prev) => [...prev, ...filesToAdd]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductForm) => {
    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
      toast.error("Please keep at least one product image");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("price", data.price);
      formData.append("category", data.category);
      formData.append("stock_quantity", data.stock_quantity);
      formData.append("status", data.status);

      // Keep track of existing images to retain
      existingImages.forEach((img) => {
        formData.append("existing_images", img);
      });

      // Add new images
      newImages.forEach((image) => {
        formData.append("images", image);
      });

      await api.postFormData(`/api/products/${params.id}`, formData);
      toast.success("Product updated successfully!");
      router.push("/seller/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl">
        <Skeleton className="h-5 w-32 mb-6" />
        <Skeleton className="h-8 w-48 mb-6" />
        <Card>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const totalImages = existingImages.length + newImages.length;

  return (
    <div className="max-w-2xl">
      <Link
        href="/seller/products"
        className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-black mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <h1 className="text-2xl font-semibold mb-6">Edit Product</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Product Images <span className="text-[#EF4444]">*</span>
            </label>
            <p className="text-xs text-[#6B7280] mb-3">
              Up to 4 images. First image will be the main product image.
            </p>

            <div className="grid grid-cols-4 gap-3">
              {/* Existing Images */}
              {existingImages.map((image, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative aspect-square border border-[#E5E7EB] rounded-lg overflow-hidden group"
                >
                  <Image
                    src={image}
                    alt={`Product ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-[#EF4444]" />
                  </button>
                  {index === 0 && newImages.length === 0 && (
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black text-white text-xs rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}

              {/* New Images */}
              {newImagePreviews.map((preview, index) => (
                <div
                  key={`new-${index}`}
                  className="relative aspect-square border border-[#E5E7EB] rounded-lg overflow-hidden group"
                >
                  <Image
                    src={preview}
                    alt={`New ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-[#EF4444]" />
                  </button>
                  <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                    New
                  </span>
                </div>
              ))}

              {totalImages < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-[#E5E7EB] rounded-lg flex flex-col items-center justify-center gap-2 hover:border-black hover:bg-[#F9FAFB] transition-colors"
                >
                  <Upload className="w-6 h-6 text-[#9CA3AF]" />
                  <span className="text-xs text-[#6B7280]">Add Image</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Title */}
          <Input
            label="Product Title"
            placeholder="e.g., Handmade Cotton T-Shirt"
            {...register("title", {
              required: "Title is required",
              maxLength: {
                value: 100,
                message: "Title must be 100 characters or less",
              },
            })}
            error={errors.title?.message}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Description
            </label>
            <textarea
              placeholder="Describe your product..."
              {...register("description", {
                maxLength: {
                  value: 1000,
                  message: "Description must be 1000 characters or less",
                },
              })}
              className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-black resize-none"
              rows={4}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-[#EF4444]">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              placeholder="999"
              step="0.01"
              min="0"
              {...register("price", {
                required: "Price is required",
                min: {
                  value: 0,
                  message: "Price must be positive",
                },
              })}
              error={errors.price?.message}
            />

            <Input
              label="Stock Quantity"
              type="number"
              placeholder="50"
              min="0"
              {...register("stock_quantity", {
                required: "Stock quantity is required",
                min: {
                  value: 0,
                  message: "Stock must be 0 or more",
                },
              })}
              error={errors.stock_quantity?.message}
            />
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Category <span className="text-[#EF4444]">*</span>
              </label>
              <select
                {...register("category", {
                  required: "Please select a category",
                })}
                className="w-full h-11 px-4 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-black bg-white"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-[#EF4444]">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full h-11 px-4 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-black bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/seller/products")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
