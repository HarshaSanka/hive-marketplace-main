"use client";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Package, Zap, Users, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

// Hexagon background pattern component
function HexagonPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute top-0 right-0 w-[800px] h-[800px] opacity-[0.03]"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hexagons" width="28" height="49" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <path
              d="M14 0L28 8v16l-14 8L0 24V8L14 0z M14 49L28 41V25l-14-8L0 25v16l14 8z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-[0.02]"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hexagons2" width="28" height="49" patternUnits="userSpaceOnUse" patternTransform="scale(3)">
            <path
              d="M14 0L28 8v16l-14 8L0 24V8L14 0z M14 49L28 41V25l-14-8L0 25v16l14 8z"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons2)" />
      </svg>
    </div>
  );
}

// Feature card component
function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  delay 
}: { 
  icon: typeof Package; 
  title: string; 
  description: string;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`group p-6 bg-white border border-[#E5E7EB] rounded-xl transition-all duration-500 hover:border-black hover:shadow-md ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-lg bg-[#F9FAFB] group-hover:bg-black transition-colors duration-300">
        <Icon className="w-6 h-6 text-[#4B5563] group-hover:text-white transition-colors duration-300" strokeWidth={2} />
      </div>
      <h3 className="text-lg font-semibold text-[#111827] mb-2">{title}</h3>
      <p className="text-[#6B7280] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="text-black" />
          </Link>
          
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="secondary" className="h-10 px-5 text-sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" className="h-10 px-5 text-sm">
                Create account
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <HexagonPattern />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Animated tagline badge */}
            <div 
              className={`inline-flex items-center gap-2 px-4 py-2 mb-8 bg-[#F9FAFB] rounded-full border border-[#E5E7EB] transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-sm text-[#4B5563] font-medium">Marketplace for the mindful</span>
            </div>

            {/* Hero headline */}
            <h1 
              className={`text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-[1.1] tracking-tight mb-6 transition-all duration-700 delay-100 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Shop smart.
              <br />
              <span className="relative">
                Support small.
                <svg 
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#F59E0B] opacity-30"
                  viewBox="0 0 200 12" 
                  preserveAspectRatio="none"
                >
                  <path 
                    d="M0 6 Q50 0, 100 6 T200 6" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Hero description */}
            <p 
              className={`text-xl text-[#6B7280] leading-relaxed max-w-xl mb-10 transition-all duration-700 delay-200 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Hive is a minimal marketplace where small sellers and smart shoppers come together. 
              Discover unique products without the overwhelming clutter.
            </p>

            {/* CTA buttons */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link href="/register">
                <Button 
                  variant="primary" 
                  className="h-12 px-8 text-base group"
                >
                  <span className="flex items-center gap-2">
                    Start shopping
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </Button>
              </Link>
              <Link href="/register?role=seller">
                <Button 
                  variant="secondary" 
                  className="h-12 px-8 text-base"
                >
                  Become a seller
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div 
              className={`flex items-center gap-6 mt-12 pt-8 border-t border-[#E5E7EB] transition-all duration-700 delay-500 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div>
                <p className="text-2xl font-bold text-black">500+</p>
                <p className="text-sm text-[#6B7280]">Active sellers</p>
              </div>
              <div className="w-px h-10 bg-[#E5E7EB]" />
              <div>
                <p className="text-2xl font-bold text-black">10k+</p>
                <p className="text-sm text-[#6B7280]">Happy shoppers</p>
              </div>
              <div className="w-px h-10 bg-[#E5E7EB]" />
              <div>
                <p className="text-2xl font-bold text-black">50k+</p>
                <p className="text-sm text-[#6B7280]">Products listed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 
              className={`text-3xl md:text-4xl font-bold text-black mb-4 transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Why choose hive?
            </h2>
            <p className="text-lg text-[#6B7280]">
              Built for the modern shopper who values simplicity and authenticity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Zap}
              title="Lightning fast"
              description="Minimal, clean interface designed for quick browsing. Find what you need in seconds."
              delay={100}
            />
            <FeatureCard
              icon={Package}
              title="Unique products"
              description="Discover handpicked items from small sellers you won't find anywhere else."
              delay={200}
            />
            <FeatureCard
              icon={Users}
              title="Community driven"
              description="Join a growing community of conscious shoppers supporting small businesses."
              delay={300}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Trusted & transparent"
              description="No dark patterns. Clear pricing. Honest reviews. Shopping the way it should be."
              delay={400}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexCta" width="56" height="100" patternUnits="userSpaceOnUse">
                <path
                  d="M28 0L56 16v32l-28 16L0 48V16L28 0z"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexCta)" />
          </svg>
        </div>
        
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to join the hive?
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Whether you're here to shop or sell, there's a place for you in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button 
                variant="primary" 
                className="h-12 px-8 text-base bg-white text-black hover:bg-gray-100"
              >
                Get started free
              </Button>
            </Link>
            <Link href="/search">
              <Button 
                variant="secondary" 
                className="h-12 px-8 text-base border-gray-600 text-white hover:bg-white/10"
              >
                Browse products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo className="text-black" />
            <span className="text-sm text-[#6B7280]">© 2025 hive. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-8">
            <Link href="#" className="text-sm text-[#6B7280] hover:text-black transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-sm text-[#6B7280] hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-[#6B7280] hover:text-black transition-colors">
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
