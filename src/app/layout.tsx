import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AFTERLIGHT — Survive the night",
  description:
    "A playable canvas survival arcade. Move. Grow stronger. Make it to dawn.",
};
// The canvas owns touch gestures, so pinch and double-tap zoom must not fight the joystick.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a1519",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
