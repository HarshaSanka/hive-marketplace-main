"use client";

import { StarRating } from "./StarRating";

interface Review {
  id: string;
  user: {
    name: string;
  };
  rating: number;
  review_text: string | null;
  created_at: string;
}

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        if (diffMinutes === 0) return "Just now";
        return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? "s" : ""} ago`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  };

  return (
    <div className="border-b border-[#E5E7EB] pb-4 last:border-0 last:pb-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-sm text-[#111827] font-medium">
            {review.rating}.0
          </span>
        </div>
        <span className="text-sm text-[#9CA3AF]">
          {getRelativeTime(review.created_at)}
        </span>
      </div>
      <p className="text-sm text-[#6B7280] mb-1">{review.user.name}</p>
      {review.review_text && (
        <p className="text-sm text-[#111827] mt-2">{review.review_text}</p>
      )}
    </div>
  );
}

interface ReviewsListProps {
  reviews: Review[];
  showAll?: boolean;
  maxReviews?: number;
}

export function ReviewsList({
  reviews,
  showAll = false,
  maxReviews = 10,
}: ReviewsListProps) {
  const displayReviews = showAll ? reviews : reviews.slice(0, maxReviews);

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-[#6B7280]">
        <p>No reviews yet</p>
        <p className="text-sm mt-1">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

interface RatingDistributionProps {
  distribution: Record<string, number>;
  totalReviews: number;
}

export function RatingDistribution({
  distribution,
  totalReviews,
}: RatingDistributionProps) {
  const ratings = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-2">
      {ratings.map((rating) => {
        const count = distribution[rating.toString()] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={rating} className="flex items-center gap-2">
            <span className="text-sm text-[#6B7280] w-8">{rating} ★</span>
            <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F59E0B] rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-[#6B7280] w-8">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
