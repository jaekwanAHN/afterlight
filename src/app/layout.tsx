import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "./site";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // `/game` serves the same page as `/`; one canonical keeps it out of the index as a duplicate.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};
// The canvas owns touch gestures, so pinch and double-tap zoom must not fight the joystick.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a1519",
};
const structuredData = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "ko",
  genre: ["Action", "Survival", "Roguelite"],
  gamePlatform: "Web Browser",
  applicationCategory: "Game",
  operatingSystem: "Any",
  playMode: "SinglePlayer",
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
