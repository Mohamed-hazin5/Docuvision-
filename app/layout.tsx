import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SwupProvider } from "@/components/providers/SwupProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { UserProvider } from "@/components/providers/UserProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocuVision Motion",
  description: "GSAP + Lenis + Swup motion stack inside Next.js",
};

import { UISettingsProvider } from "@/components/providers/UISettingsProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white text-slate-900 antialiased`}
      >
        <UISettingsProvider>
          <UserProvider>
            <SwupProvider>
              <SmoothScrollProvider>{children}</SmoothScrollProvider>
            </SwupProvider>
          </UserProvider>
        </UISettingsProvider>
      </body>
    </html>
  );
}
