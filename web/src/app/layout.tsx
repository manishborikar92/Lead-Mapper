import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowEasy Lead-Mapper — AI-Powered CRM CSV Importer",
  description: "Upload, preview, and map any messy CSV structure into standard GrowEasy CRM fields instantly using Google Gemini AI routing and fallback networks.",
  metadataBase: new URL("https://groweasy-lead-mapper.vercel.app"),
  appleWebApp: {
    title: "Lead Mapper",
  },
  openGraph: {
    title: "GrowEasy Lead-Mapper — AI-Powered CRM CSV Importer",
    description: "Upload, preview, and map any messy CSV structure into standard GrowEasy CRM fields instantly using Google Gemini AI routing and fallback networks.",
    url: "https://groweasy-lead-mapper.vercel.app",
    siteName: "GrowEasy Lead-Mapper",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GrowEasy Lead-Mapper AI CSV Importer Dashboard"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ink text-hi">
        {children}
      </body>
    </html>
  );
}
