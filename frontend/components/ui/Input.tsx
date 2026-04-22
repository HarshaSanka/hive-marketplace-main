import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#111827] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "h-11 w-full px-4 rounded-lg border text-base",
            "focus:outline-none focus:border-black",
            error
              ? "border-[#EF4444] focus:border-[#EF4444]"
              : "border-[#E5E7EB]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
            <span>⚠</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#6B7280]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
