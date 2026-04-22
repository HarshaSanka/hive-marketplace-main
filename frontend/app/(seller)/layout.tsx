"use client";

import { SellerSidebar } from "@/components/SellerSidebar";
import { Header } from "@/components/Header";
import { SellerGuard } from "@/app/utils/RoleGuard";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellerGuard>
      <div className="min-h-screen bg-[#F9FAFB] flex">
        <SellerSidebar />
        <div className="flex-1">
          <Header />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </SellerGuard>
  );
}
