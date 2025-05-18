import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientSideCalculations from "./client-template";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "keact",
  description: "Keact is a minimal, key-based global state manager for React. No providers, no boilerplate — just a single hook to share state across your app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >        
        <ClientSideCalculations />
        {children}
      </body>
    </html>
  );
}
