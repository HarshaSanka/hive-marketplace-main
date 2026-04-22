import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  images: string[];
  average_rating?: number;
  total_reviews?: number;
}

export function ProductCard({
  id,
  title,
  price,
  images,
  average_rating,
  total_reviews,
}: ProductCardProps) {
  const imageUrl = images && images.length > 0 ? images[0] : "/placeholder-product.jpg";
  const displayPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <Link href={`/product/${id}`}>
      <div className="w-full max-w-[280px] border border-[#E5E7EB] rounded-xl overflow-hidden hover:shadow-md hover:border-black transition-all cursor-pointer">
        <div className="relative w-full aspect-square">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="280px"
          />
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-[#111827] line-clamp-2 mb-2 min-h-[3rem]">
            {title}
          </h3>
          <p className="text-lg font-bold text-[#111827] mb-2">{displayPrice}</p>
          {average_rating && total_reviews !== undefined && (
            <div className="flex items-center gap-1 text-sm text-[#6B7280]">
              <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
              <span>{average_rating.toFixed(1)}</span>
              <span>({total_reviews})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
