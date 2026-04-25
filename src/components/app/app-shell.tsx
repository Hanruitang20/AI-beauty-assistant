"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MobileAppFrame } from "@/components/layout/mobile-app-frame";
import { Button } from "@/components/ui/button";

const bottomNavItems = [
  { href: "/app/products", label: "产品库" },
  { href: "/app/recommendations", label: "推荐" },
  { href: "/app/profile", label: "档案" },
];

type AppShellProps = {
  children: ReactNode;
};

const headerTitleMap: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /^\/app\/products\/new$/, title: "新增产品" },
  { pattern: /^\/app\/products\/[^/]+\/edit$/, title: "编辑产品" },
  { pattern: /^\/app\/products\/[^/]+$/, title: "产品详情" },
  { pattern: /^\/app\/products$/, title: "产品库" },
  { pattern: /^\/app\/recommendations$/, title: "推荐建议" },
  { pattern: /^\/app\/profile$/, title: "个人档案" },
  { pattern: /^\/app\/assessment$/, title: "快速测评" },
  { pattern: /^\/app\/onboarding$/, title: "开始设置" },
  { pattern: /^\/app$/, title: "BeautyShelf AI" },
];

const backEnabledPatterns = [/^\/app\/products\/new$/, /^\/app\/products\/[^/]+$/, /^\/app\/products\/[^/]+\/edit$/];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const headerTitle = headerTitleMap.find((item) => item.pattern.test(pathname))?.title || "BeautyShelf AI";
  const showBack = backEnabledPatterns.some((pattern) => pattern.test(pathname));

  return (
    <MobileAppFrame>
      <div className="relative min-h-[calc(100vh-2rem)] bg-gradient-to-b from-rose-50 via-white to-pink-50">
        <header className="sticky top-0 z-20 border-b border-rose-100 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 pb-3 pt-4">
            {showBack ? (
              <Link href="/app/products">
                <Button variant="ghost" className="h-9 px-3 text-xs">
                  返回
                </Button>
              </Link>
            ) : (
              <Link href="/" className="text-sm font-semibold tracking-tight text-rose-900">
                BeautyShelf AI
              </Link>
            )}
            <h1 className="text-sm font-semibold text-rose-900">{headerTitle}</h1>
            <div className="w-16" />
          </div>
        </header>

        <main className="px-4 pb-24 pt-4">{children}</main>

        <nav className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 rounded-2xl border border-rose-100 bg-white/95 p-2 shadow-lg backdrop-blur">
          <div className="grid grid-cols-3 gap-1">
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-2 py-2 text-center text-xs font-medium transition",
                  pathname.startsWith(item.href)
                    ? "bg-rose-100 text-rose-900 shadow-sm"
                    : "text-rose-600 hover:bg-rose-50",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </MobileAppFrame>
  );
}
