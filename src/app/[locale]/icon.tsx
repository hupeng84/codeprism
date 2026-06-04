import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg viewBox="0 0 100 100" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B"/>
              <stop offset="50%" stopColor="#FF8E53"/>
              <stop offset="100%" stopColor="#FFD93D"/>
            </linearGradient>
          </defs>
          {/* Hexagon - tight to edges */}
          <path d="M50 5 L90 27 L90 73 L50 95 L10 73 L10 27 Z"
                fill="url(#hexGrad)" opacity="0.95"/>
          {/* Play triangle */}
          <polygon points="38,28 38,72 68,50" fill="white"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}