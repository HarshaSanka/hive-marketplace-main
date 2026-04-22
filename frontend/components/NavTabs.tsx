"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Package, User } from "lucide-react";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/profile", label: "Profile", icon: User },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-[#E5E7EB]">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 py-3 border-b-2 transition-colors ${
                  isActive
                    ? "border-black text-black font-medium"
                    : "border-transparent text-[#6B7280] hover:text-black"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
