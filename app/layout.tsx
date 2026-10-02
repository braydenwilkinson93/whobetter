import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://whobetter.vercel.app"
  ),
  title: "who better?",
  description: "Settle the debate. Vote head-to-head, see where the world stands.",
  openGraph: {
    title: "who better?",
    description:
      "Settle the debate. Vote head-to-head, see where the world stands.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "who better?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "who better?",
    description:
      "Settle the debate. Vote head-to-head, see where the world stands.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} h-full`}>
      <body className="wb-bg min-h-full antialiased">{children}</body>
    </html>
  );
}
