import type { Metadata } from "next";
import { Inter, Playfair_Display, Source_Sans_3 } from "next/font/google";
import { Suspense } from "react";
import { DarkModePreview } from "@/components/DarkModePreview";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans" });

export const metadata: Metadata = {
  title: "Portfolio - Nexora",
  description: "Your AI-powered portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${sourceSans.variable}`}>
      <body className="antialiased">
        <Suspense fallback={null}>
          <DarkModePreview />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
