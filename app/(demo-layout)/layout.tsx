"use client";

import Header from "@/components/header";

export default function DemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <Header />
        {children}
    </>
  );
}
