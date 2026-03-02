import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ZenBackground from "@/components/ZenBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fred - Fact Checker",
  description: "AI Agent to verify claims via Perplexity API.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scrollbar-zen">
      <body className={`${inter.className} min-h-screen bg-[#faf9f6]`}>
        <ZenBackground />
        {children}
      </body>
    </html>
  );
}
