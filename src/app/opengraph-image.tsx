import { ImageResponse } from "next/og";
// Rendered at build time. Latin text only: the bundled OG font has no Hangul or symbol
// glyphs, and the build cannot fetch fallback fonts for them.
export const alt = "AFTERLIGHT — Survive the night";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background:
          "linear-gradient(160deg, #0a1519 0%, #101e22 60%, #16292b 100%)",
        color: "#ecf2e8",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 30,
          letterSpacing: 6,
          color: "#8faaa1",
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: "#c1f78c",
          }}
        />
        <span>AFTERLIGHT</span>
        <span style={{ color: "#8ddcc5" }}>SURVIVAL ARCADE</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 120, fontWeight: 700, lineHeight: 1 }}>
          Outnumbered.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 120,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          <span>Never&nbsp;</span>
          <span style={{ color: "#c1f78c" }}>outshone.</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 40,
          fontSize: 26,
          letterSpacing: 3,
          color: "#8faaa1",
        }}
      >
        <span>10 MINUTE RUN</span>
        <span>EVERY RUN IS DIFFERENT</span>
        <span>PLAY IN BROWSER</span>
      </div>
    </div>,
    size,
  );
}
