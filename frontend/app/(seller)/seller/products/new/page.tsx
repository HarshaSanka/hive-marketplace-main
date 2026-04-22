"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Upload, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Food",
  "Handmade",
  "Other",
];

interface ProductForm {
  title: string;
  description: string;
  price: string;
  category: string;
  stock_quantity: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductForm>({
    defaultValues: {
      category: "",
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 4 - images.length;
    const newFiles = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.error(`You can only upload up to 4 images. ${files.length - remainingSlots} file(s) were not added.`);
    }

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImages((prev) => [...prev, ...newFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductForm) => {
    if (images.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("price", data.price);
      formData.append("category", data.category);
      formData.append("stock_quantity", data.stock_quantity);

      images.forEach((image) => {
        formData.append("images", image);
      });

      await api.postFormData("/api/products", formData);
      toast.success("Product created successfully!");
      router.push("/seller/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link
        href="/seller/products"
        className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-black mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <h1 className="text-2xl font-semibold mb-6">Add New Product</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Product Images <span className="text-[#EF4444]">*</span>
            </label>
            <p className="text-xs text-[#6B7280] mb-3">
              Upload up to 4 images. First image will be the main product image.
            </p>

            <div className="grid grid-cols-4 gap-3">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square border border-[#E5E7EB] rounded-lg overflow-hidden group"
                >
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-[#EF4444]" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black text-white text-xs rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}

              {images.length < 4 && (
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

          {/* Category */}
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

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/seller/products")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Create Product
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
