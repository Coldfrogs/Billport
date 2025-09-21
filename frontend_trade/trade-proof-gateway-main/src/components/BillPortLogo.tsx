import React from "react";

type BillPortLogoProps = {
  size?: number;
  withWordmark?: boolean;
  tagline?: string;
  animate?: boolean;
  compact?: boolean;
  className?: string;
};

const BillPortLogo: React.FC<BillPortLogoProps> = ({
  size = 56,
  withWordmark = true,
  tagline,
  animate = false,
  compact = false,
  className = "",
}) => {
  const badgeSize = size;
  const showWord = withWordmark && !compact;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Badge */}
      <svg
        width={badgeSize}
        height={badgeSize}
        viewBox="0 0 64 64"
        className={animate ? "animate-spin-slow" : ""}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          <radialGradient id="bp-glow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.22" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="bp-doc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#E5E7EB" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Badge background */}
        <circle cx="32" cy="32" r="30" fill="url(#bp-grad)" />
        <circle cx="32" cy="26" r="18" fill="url(#bp-glow)" />

        {/* Document + folded corner */}
        <g transform="translate(20,16)">
          <rect x="0" y="0" rx="4" ry="4" width="24" height="30" fill="url(#bp-doc)" />
          <path d="M18 0 L24 6 L18 6 Z" fill="#D1D5DB" />
          <rect x="4" y="10" width="16" height="2" fill="#CBD5E1" />
          <rect x="4" y="15" width="12" height="2" fill="#CBD5E1" />
          <rect x="4" y="20" width="10" height="2" fill="#CBD5E1" />
        </g>

        {/* Checkmark */}
        <path
          d="M26 38 l5 5 12 -12"
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}
        />
      </svg>

      {/* Wordmark */}
      {showWord && (
        <div className="leading-tight">
          <div className="text-2xl md:text-3xl font-bold glow-text">
            BillPort
          </div>
          {tagline && (
            <div className="text-xs md:text-sm text-muted-foreground mt-1">
              {tagline}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BillPortLogo;