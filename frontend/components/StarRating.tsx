"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const handleClick = (starRating: number) => {
    if (interactive && onChange) {
      onChange(starRating);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, starRating: number) => {
    if (interactive && onChange && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onChange(starRating);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        const isHalfFilled = !isFilled && starValue - 0.5 <= rating;

        return (
          <span
            key={i}
            onClick={() => handleClick(starValue)}
            onKeyDown={(e) => handleKeyDown(e, starValue)}
            tabIndex={interactive ? 0 : undefined}
            role={interactive ? "button" : undefined}
            aria-label={interactive ? `Rate ${starValue} star${starValue !== 1 ? "s" : ""}` : undefined}
            className={cn(
              interactive && "cursor-pointer hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-[#F59E0B] rounded"
            )}
          >
            <Star
              className={cn(
                sizes[size],
                isFilled || isHalfFilled
                  ? "fill-[#F59E0B] text-[#F59E0B]"
                  : "text-[#E5E7EB]"
              )}
            />
          </span>
        );
      })}
      {showValue && (
        <span className={cn("font-medium ml-1", textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  error?: string;
  label?: string;
}

export function StarRatingInput({
  value,
  onChange,
  error,
  label,
}: StarRatingInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[#111827]">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <StarRating
          rating={value}
          size="lg"
          interactive
          onChange={onChange}
        />
        <span className="text-[#6B7280]">
          {value === 0
            ? "Select rating"
            : value === 1
            ? "1 star"
            : `${value} stars`}
        </span>
      </div>
      {error && <p className="text-sm text-[#EF4444]">{error}</p>}
    </div>
  );
}
