import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Barlow_Condensed, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const menuDisplay = Barlow_Condensed({
  variable: "--font-menu-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ÑUWAVE Specialty Coffee | Iloilo City",
  description: "Welcome to ÑUWAVE Specialty Coffee in Iloilo City. Discover our house rules, find us on Fajardo & Libertad Street, and explore the menu.",
};

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${menuDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
