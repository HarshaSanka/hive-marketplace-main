import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "text";
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  children,
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "h-11 px-6 rounded-lg font-medium text-base transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variants = {
    primary: "bg-black text-white hover:bg-[#1a1a1a] active:bg-[#333333]",
    secondary: "bg-transparent border border-[#E5E7EB] text-black hover:bg-[#F3F4F6]",
    text: "bg-transparent text-black underline hover:text-[#4B5563] p-0",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
