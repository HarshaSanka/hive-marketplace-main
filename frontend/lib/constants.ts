// Hive Brand Constants

export const BRAND_COLORS = {
  primary: "#000000",
  primaryHover: "#1a1a1a",
  secondary: "#6B7280",
  secondaryHover: "#4B5563",
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F9FAFB",
  bgTertiary: "#F3F4F6",
  border: "#E5E7EB",
  borderFocus: "#000000",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  hiveHoney: "#F59E0B",
} as const;

export const SPACING = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
} as const;

export const TYPOGRAPHY = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  sizes: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
