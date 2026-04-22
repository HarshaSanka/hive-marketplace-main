"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface RegisterForm {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  mobile: string;
  account_type: "buyer" | "seller";
  business_name?: string;
  business_address?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<"buyer" | "seller">("buyer");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      account_type: "buyer",
    },
  });

  const password = watch("password");

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number";
    }
    return true;
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError("");
    try {
      const payload: any = {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        mobile: data.mobile,
        account_type: accountType,
      };

      if (accountType === "seller") {
        payload.business_name = data.business_name;
        payload.business_address = data.business_address;
      }

      const response = await api.post<{
        access_token: string;
        user: {
          id: string;
          email: string;
          full_name: string;
          mobile: string;
          account_type: "buyer" | "seller";
        };
      }>("/api/auth/register", payload);

      login(response.access_token, response.user);

      // Redirect based on account type
      if (response.user.account_type === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/home");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h1 className="text-2xl font-semibold mb-6">Create Account</h1>
      {error && (
        <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#EF4444] rounded-lg text-sm text-[#EF4444]">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setAccountType("buyer")}
            className={`flex-1 h-11 rounded-lg font-medium transition-colors ${
              accountType === "buyer"
                ? "bg-black text-white"
                : "bg-transparent border border-[#E5E7EB] text-black hover:bg-[#F3F4F6]"
            }`}
          >
            Buyer
          </button>
          <button
            type="button"
            onClick={() => setAccountType("seller")}
            className={`flex-1 h-11 rounded-lg font-medium transition-colors ${
              accountType === "seller"
                ? "bg-black text-white"
                : "bg-transparent border border-[#E5E7EB] text-black hover:bg-[#F3F4F6]"
            }`}
          >
            Seller
          </button>
        </div>

        <Input
          label="Full Name"
          {...register("full_name", { required: "Full name is required" })}
          error={errors.full_name?.message}
        />
        <Input
          label="Email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          error={errors.email?.message}
        />
        <Input
          label="Mobile"
          type="tel"
          {...register("mobile", { required: "Mobile number is required" })}
          error={errors.mobile?.message}
        />
        <Input
          label="Password"
          type="password"
          {...register("password", {
            required: "Password is required",
            validate: validatePassword,
          })}
          error={errors.password?.message}
          helperText="Min 8 chars, 1 uppercase, 1 number"
        />
        <Input
          label="Confirm Password"
          type="password"
          {...register("confirm_password", {
            required: "Please confirm your password",
            validate: (value) =>
              value === password || "Passwords do not match",
          })}
          error={errors.confirm_password?.message}
        />

        {accountType === "seller" && (
          <>
            <Input
              label="Business Name"
              {...register("business_name", {
                required: "Business name is required for sellers",
              })}
              error={errors.business_name?.message}
            />
            <Input
              label="Business Address"
              {...register("business_address", {
                required: "Business address is required for sellers",
              })}
              error={errors.business_address?.message}
            />
          </>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </form>
      <p className="mt-6 text-sm text-center text-[#6B7280]">
        Already have an account?{" "}
        <Link href="/login" className="text-black underline hover:text-[#4B5563]">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
