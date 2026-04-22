"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function Header() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { totalItems } = useCartStore();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href={isAuthenticated ? (user?.account_type === "seller" ? "/seller/dashboard" : "/home") : "/"} className="flex items-center">
          <Logo />
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 pl-10 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-black"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          </div>
        </form>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/cart"
                className="relative p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-[#111827]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F59E0B] text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              <div className="relative group">
                <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                  <User className="w-5 h-5 text-[#111827]" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-2">
                    <p className="text-sm font-medium text-[#111827] px-3 py-2">
                      {user?.full_name}
                    </p>
                    <Link
                      href={user?.account_type === "seller" ? "/seller/dashboard" : "/profile"}
                      className="block text-sm text-[#6B7280] px-3 py-2 hover:bg-[#F3F4F6] rounded"
                    >
                      Profile
                    </Link>
                    {user?.account_type === "buyer" && (
                      <Link
                        href="/orders"
                        className="block text-sm text-[#6B7280] px-3 py-2 hover:bg-[#F3F4F6] rounded"
                      >
                        Orders
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-sm text-[#6B7280] px-3 py-2 hover:bg-[#F3F4F6] rounded flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Link href="/login">
              <button className="h-10 px-4 bg-black text-white rounded-lg hover:bg-[#1a1a1a] transition-colors">
                Sign in
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
