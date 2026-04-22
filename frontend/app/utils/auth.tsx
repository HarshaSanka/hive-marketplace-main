"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const publicRoutes = ["/login", "/register"];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!isAuthenticated && !isPublicRoute) {
      router.push(`/login?redirect=${pathname}`);
    } else if (isAuthenticated && isPublicRoute) {
      // Redirect to appropriate dashboard based on account type
      if (user?.account_type === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/home");
      }
    }
  }, [isAuthenticated, pathname, router, user]);

  // Don't render children if redirecting
  if (!isAuthenticated && !["/login", "/register"].includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
