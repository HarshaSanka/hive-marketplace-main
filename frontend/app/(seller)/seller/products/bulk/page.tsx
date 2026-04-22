"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, ArrowLeft, Download, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface BulkUploadResult {
  total_rows: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
  products_created: string[];
}

export default function BulkUploadPage() {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a CSV file first");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.postFormData<BulkUploadResult>(
        "/api/products/bulk-upload",
        formData
      );

      setResult(response);

      if (response.failed === 0) {
        toast.success(`Successfully created ${response.successful} products!`);
      } else {
        toast.error(`Created ${response.successful} products, ${response.failed} failed`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload products");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `title,description,price,category,stock_quantity,image_url_1,image_url_2,image_url_3,image_url_4
"Example Product","Product description here",999,Electronics,50,https://example.com/image1.jpg,,,
"Another Product","Another description",1299,Fashion,25,https://example.com/image2.jpg,https://example.com/image3.jpg,,`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
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

      <h1 className="text-2xl font-semibold mb-6">Bulk Upload Products</h1>

      <Card className="mb-6">
        <h2 className="font-medium mb-4">CSV Format</h2>
        <p className="text-sm text-[#6B7280] mb-4">
          Upload a CSV file with up to 100 products. Each row should contain the following columns:
        </p>

        <div className="bg-[#F9FAFB] rounded-lg p-4 mb-4 overflow-x-auto">
          <code className="text-xs text-[#374151]">
            title, description, price, category, stock_quantity, image_url_1, image_url_2, image_url_3, image_url_4
          </code>
        </div>

        <div className="text-sm text-[#6B7280] space-y-1 mb-4">
          <p><strong>Categories:</strong> Electronics, Fashion, Home, Beauty, Food, Handmade, Other</p>
          <p><strong>Images:</strong> Provide URLs to publicly accessible images (at least 1 required)</p>
        </div>

        <Button variant="secondary" onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </Card>

      <Card>
        {/* File Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            selectedFile
              ? "border-black bg-[#F9FAFB]"
              : "border-[#E5E7EB] hover:border-black hover:bg-[#F9FAFB]"
          }`}
        >
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <FileSpreadsheet className="w-12 h-12 text-black mb-3" />
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-[#6B7280]">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setResult(null);
                }}
                className="mt-3 text-sm text-[#EF4444] hover:underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-[#9CA3AF] mb-3" />
              <p className="font-medium mb-1">Drop your CSV file here</p>
              <p className="text-sm text-[#6B7280]">or click to browse</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Results */}
        {result && (
          <div className="mt-6 p-4 bg-[#F9FAFB] rounded-lg">
            <h3 className="font-medium mb-3">Upload Results</h3>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <p className="text-2xl font-semibold">{result.total_rows}</p>
                <p className="text-xs text-[#6B7280]">Total Rows</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-green-600">{result.successful}</p>
                <p className="text-xs text-[#6B7280]">Successful</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-red-600">{result.failed}</p>
                <p className="text-xs text-[#6B7280]">Failed</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="border-t border-[#E5E7EB] pt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#EF4444]" />
                  Errors
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <p key={index} className="text-sm text-[#EF4444]">
                      Row {error.row}: {error.error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {result.successful > 0 && (
              <div className="flex items-center gap-2 mt-4 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{result.successful} products created successfully</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/seller/products")}
            disabled={isLoading}
          >
            {result ? "Done" : "Cancel"}
          </Button>
          <Button onClick={handleUpload} isLoading={isLoading} disabled={!selectedFile}>
            Upload Products
          </Button>
        </div>
      </Card>
    </div>
  );
}
