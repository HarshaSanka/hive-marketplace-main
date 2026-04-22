"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: "buyer" | "seller";
  requireAuth?: boolean; // If false, allows unauthenticated users
}

export function RoleGuard({ children, allowedRole, requireAuth = true }: RoleGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // If not authenticated
      if (!isAuthenticated) {
        if (requireAuth) {
          // Auth required - redirect to login
          router.push("/login");
          return;
        }
        // Auth not required - allow access
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // User is authenticated - check role
      if (user?.account_type !== allowedRole) {
        // Wrong role - redirect to appropriate dashboard
        if (user?.account_type === "seller") {
          router.push("/seller/dashboard");
        } else {
          router.push("/home");
        }
        return;
      }

      // Authorized
      setIsAuthorized(true);
      setIsChecking(false);
    };

    // Small delay to allow zustand to hydrate from localStorage
    const timer = setTimeout(checkAuth, 50);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, allowedRole, requireAuth, router]);

  // Show loading while checking authorization
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

// Seller guard - always requires auth
export function SellerGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRole="seller" requireAuth={true}>{children}</RoleGuard>;
}

// Buyer area guard - allows unauthenticated users but blocks sellers
// Public pages like search, product details are accessible to all
// Protected pages like cart, orders will have additional auth check
export function BuyerAreaGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // If authenticated as seller, redirect to seller dashboard
      if (isAuthenticated && user?.account_type === "seller") {
        router.push("/seller/dashboard");
        return;
      }

      // Allow access (unauthenticated or buyer)
      setIsAuthorized(true);
      setIsChecking(false);
    };

    const timer = setTimeout(checkAuth, 50);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

// Auth required guard - for protected buyer pages like cart, orders
export function AuthRequiredGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    const timer = setTimeout(checkAuth, 50);
    return () => clearTimeout(timer);
  }, [isAuthenticated, pathname, router]);

  if (isChecking || !isAuthorized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return <>{children}</>;
}
