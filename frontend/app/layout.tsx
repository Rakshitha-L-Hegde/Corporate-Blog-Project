import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SearchBar from "@/components/SearchBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://corporate-blog-project.vercel.app/"),

  title: {
    default: "The Corporate Blog",
    template: "%s | The Corporate Blog",
  },

  description:
    "A production-grade corporate blogging platform focused on SEO, performance, and authority building.",

  keywords: [
    "corporate blog",
    "business blogging",
    "SEO blog platform",
    "Next.js blog",
    "content marketing",
  ],

  openGraph: {
    title: "The Corporate Blog",
    description:
      "A production-grade blogging platform built for performance and SEO.",
    url: "https://corporate-blog-project.vercel.app/",
    siteName: "The Corporate Blog",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "The Corporate Blog",
    description:
      "Production-grade blogging platform built with Next.js and TypeScript.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.variable} antialiased`}
      >
        <div className="p-4">
  <SearchBar />
  {children}
</div>
      </body>
    </html>
  );
}