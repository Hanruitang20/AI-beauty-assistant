import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeautyShelf AI",
  description: "BeautyShelf AI - 护肤美妆整理与决策助手",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
