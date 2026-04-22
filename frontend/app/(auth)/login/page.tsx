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

interface LoginForm {
  email: string;
  password: string;
  remember_me: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.post<{
        access_token: string;
        user: {
          id: string;
          email: string;
          full_name: string;
          mobile: string;
          account_type: "buyer" | "seller";
        };
      }>("/api/auth/login", {
        email: data.email,
        password: data.password,
        remember_me: data.remember_me,
      });

      login(response.access_token, response.user);

      // Redirect based on account type
      if (response.user.account_type === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/home");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h1 className="text-2xl font-semibold mb-6">Welcome Back</h1>
      {error && (
        <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#EF4444] rounded-lg text-sm text-[#EF4444]">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          label="Password"
          type="password"
          {...register("password", { required: "Password is required" })}
          error={errors.password?.message}
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember_me"
            {...register("remember_me")}
            className="w-4 h-4 border-[#E5E7EB] rounded"
          />
          <label htmlFor="remember_me" className="ml-2 text-sm text-[#6B7280]">
            Remember Me
          </label>
        </div>
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </form>
      <p className="mt-6 text-sm text-center text-[#6B7280]">
        Don't have an account?{" "}
        <Link href="/register" className="text-black underline hover:text-[#4B5563]">
          Create account
        </Link>
      </p>
    </Card>
  );
}
