import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AFTERLIGHT — Survive the night",
  description:
    "A playable canvas survival arcade. Move. Grow stronger. Make it to dawn.",
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
