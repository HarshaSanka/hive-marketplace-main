interface LogoProps {
  variant?: "wordmark" | "icon" | "monogram";
  className?: string;
}

export function Logo({ variant = "wordmark", className }: LogoProps) {
  if (variant === "icon") {
    return (
      <div className={className}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 2L28 8V24L16 30L4 24V8L16 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fontSize="16"
            fontWeight="700"
            fill="currentColor"
            fontFamily="Inter, sans-serif"
          >
            h
          </text>
        </svg>
      </div>
    );
  }

  if (variant === "monogram") {
    return (
      <span className={className} style={{ fontFamily: "Inter, sans-serif", fontWeight: 700 }}>
        h
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        fontSize: "24px",
        letterSpacing: "-0.02em",
      }}
    >
      hive
    </span>
  );
}
