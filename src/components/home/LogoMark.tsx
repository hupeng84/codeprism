export function LogoMark() {
  return (
    <svg viewBox="0 0 160 160" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B"/>
          <stop offset="50%" stopColor="#FF8E53"/>
          <stop offset="100%" stopColor="#FFD93D"/>
        </linearGradient>
      </defs>
      {/* Hexagon */}
      <path d="M80 24 L120 48 L120 98 L80 122 L40 98 L40 48 Z"
            fill="url(#hexGrad)" opacity="0.95"/>
      <path d="M80 32 L112 52 L112 94 L80 114 L48 94 L48 52 Z"
            fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      {/* Play triangle */}
      <polygon points="64,50 64,106 100,78" fill="white"/>
    </svg>
  );
}
