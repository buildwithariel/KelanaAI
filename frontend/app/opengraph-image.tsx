import { ImageResponse } from "next/og";

export const alt = "KelanaAI travel planner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "#0a1a30",
          color: "#fffcf5",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="96" height="96" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="8" fill="#10253f" />
          <path
            d="M16 3 L21 11 L29 16 L21 21 L16 29 L11 21 L3 16 L11 11 Z"
            fill="#ffb020"
          />
          <circle cx="16" cy="16" r="2.4" fill="#10253f" />
        </svg>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 100,
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          Kelana<span style={{ color: "#ffb020" }}>AI</span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 36,
            color: "#8fa6c4",
            maxWidth: 880,
            lineHeight: 1.4,
          }}
        >
          Say where you&apos;re going and what you can spend. Get a day-by-day
          plan: morning, afternoon, evening.
        </div>
      </div>
    ),
    size,
  );
}
