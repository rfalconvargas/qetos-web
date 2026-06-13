import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { FooterDiligence } from "@/components/FooterDiligence";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qetos — Calm, AI-guided metabolic health",
  description:
    "Qetos turns dense functional-medicine protocols, cravings and daily readings into calm, time-aware daily actions. Educational, not medical advice.",
  metadataBase: new URL("https://qetos.ailiur.com"),
  openGraph: {
    title: "Qetos — Calm, AI-guided metabolic health",
    description:
      "The calm layer between your protocol and your day. No streaks, no shame — just momentum.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Nav />
        {children}
        <FooterDiligence />
      </body>
    </html>
  );
}
