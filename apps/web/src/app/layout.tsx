import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexora - AI-Powered Portfolio SaaS",
  description:
    "Build your personal brand with AI-powered portfolios. Subdomain-based, timeline, blog, and AI chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
