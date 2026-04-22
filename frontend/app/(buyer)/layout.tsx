"use client";

import { Header } from "@/components/Header";
import { NavTabs } from "@/components/NavTabs";
import { BuyerAreaGuard } from "@/app/utils/RoleGuard";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BuyerAreaGuard>
      <div className="min-h-screen bg-[#F9FAFB]">
        <Header />
        <NavTabs />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </BuyerAreaGuard>
  );
}
