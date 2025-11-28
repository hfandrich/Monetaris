import React from 'react';

// --- Brand Logo ---
interface LogoProps {
  className?: string;
  animated?: boolean;
}

export const MonetarisLogo: React.FC<LogoProps> = ({
  className = 'h-10 w-auto',
  animated = false,
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" className={className}>
    <defs>
      <linearGradient id="monetarisGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
        {/* Dynamic Gradient using currentColor context from Tailwind classes */}
        {/* In Barbie mode, monetaris-400/500 are pinks, creating a Rose Gold gradient automatically */}
        <stop offset="0%" stopColor="currentColor" className="text-monetaris-400" />
        <stop offset="50%" stopColor="currentColor" className="text-monetaris-500" />
        <stop offset="100%" stopColor="currentColor" className="text-blue-500" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Stylized M / Graph Icon */}
    <path
      d="M20 60 L50 20 L80 50 L110 15 L140 40"
      fill="none"
      stroke="currentColor"
      className="text-monetaris-500 opacity-80"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#glow)"
    />
    <path
      d="M20 60 L50 20 L80 50 L110 15 L140 40"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-90"
    />
    {animated && (
      <circle
        cx="140"
        cy="40"
        r="4"
        fill="currentColor"
        className="animate-ping text-monetaris-accent"
      />
    )}
  </svg>
);

// Export alias for backward compatibility
export const Logo = MonetarisLogo;
