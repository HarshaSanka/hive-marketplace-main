import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[#E5E7EB] rounded-xl p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
