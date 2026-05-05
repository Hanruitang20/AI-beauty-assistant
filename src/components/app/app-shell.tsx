"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { MobileAppFrame } from "@/components/layout/mobile-app-frame";
import { Button } from "@/components/ui/button";
import { getSafeReturnTo } from "@/lib/navigation";

const bottomNavItems = [
  { href: "/app/products", label: "产品库" },
  { href: "/app/recommendations", label: "为你" },
  { href: "/app/profile", label: "个人" },
];

type AppShellProps = {
  children: ReactNode;
};

const headerTitleMap: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /^\/app\/notifications$/, title: "通知中心" },
  { pattern: /^\/app\/products\/all$/, title: "全部产品" },
  { pattern: /^\/app\/products\/categories$/, title: "分类浏览" },
  { pattern: /^\/app\/products\/recent$/, title: "最近查看" },
  { pattern: /^\/app\/products\/summaries$/, title: "已生成摘要" },
  { pattern: /^\/app\/products\/new$/, title: "新增产品" },
  { pattern: /^\/app\/products\/[^/]+\/edit$/, title: "编辑产品" },
  { pattern: /^\/app\/products\/[^/]+$/, title: "产品详情" },
  { pattern: /^\/app\/products$/, title: "产品库" },
  { pattern: /^\/app\/recommendations$/, title: "为你" },
  { pattern: /^\/app\/profile\/edit$/, title: "编辑个人画像" },
  { pattern: /^\/app\/profile$/, title: "个人中心" },
  { pattern: /^\/app\/assessment$/, title: "快速测评" },
  { pattern: /^\/app\/onboarding$/, title: "开始设置" },
  { pattern: /^\/app$/, title: "BeautyShelf AI" },
];

const backEnabledPatterns = [
  /^\/app\/notifications$/,
  /^\/app\/products\/all$/,
  /^\/app\/products\/categories$/,
  /^\/app\/products\/recent$/,
  /^\/app\/products\/summaries$/,
  /^\/app\/products\/new$/,
  /^\/app\/products\/[^/]+$/,
  /^\/app\/products\/[^/]+\/edit$/,
  /^\/app\/profile\/edit$/,
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const headerTitle = headerTitleMap.find((item) => item.pattern.test(pathname))?.title || "BeautyShelf AI";
  const showBack = backEnabledPatterns.some((pattern) => pattern.test(pathname));

  function getBackFallbackPath() {
    const safeReturnTo = getSafeReturnTo(searchParams.get("returnTo"), "");
    if (safeReturnTo) return safeReturnTo;
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "/app/products";
    const parentPath = `/${parts.slice(0, -1).join("/")}`;
    return parentPath || "/app/products";
  }

  function handleBack() {
    if (pathname === "/app/products/all") {
      const safeReturnTo = getSafeReturnTo(searchParams.get("returnTo"), "/app/products");
      router.replace(safeReturnTo);
      return;
    }

    if (/^\/app\/products\/[^/]+$/.test(pathname)) {
      const safeReturnTo = getSafeReturnTo(searchParams.get("returnTo"), "/app/products");
      router.replace(safeReturnTo);
      return;
    }

    const safeReturnTo = getSafeReturnTo(searchParams.get("returnTo"), "");
    if (safeReturnTo) {
      // Replace avoids keeping current detail page in history stack.
      router.replace(safeReturnTo);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(getBackFallbackPath());
  }

  return (
    <MobileAppFrame>
      <div className="relative min-h-screen bg-[var(--background)]">
        <header className="sticky top-0 z-20 border-b bg-[var(--surface)]/95 backdrop-blur" style={{ borderColor: "var(--border-soft)" }}>
          <div className="flex items-center justify-between px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
            {showBack ? (
              <Button variant="ghost" className="h-11 px-3 text-xs" onClick={handleBack}>
                返回
              </Button>
            ) : (
              <span className="inline-flex h-11 w-11" aria-hidden />
            )}
            <Link href="/" className="editorial-heading text-lg font-semibold italic tracking-tight text-[#3c3530]">
              BeautyShelf AI
            </Link>
            <Link
              href="/app/notifications"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--accent)]"
              aria-label="通知中心"
            >
              🔔
            </Link>
          </div>
          <div className="px-4 pb-3">
            <h1 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{headerTitle}</h1>
          </div>
        </header>

        <main className="overflow-x-hidden px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-5">{children}</main>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t bg-[var(--surface)]/95 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur transition-none"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <div className="mx-auto grid w-full max-w-[430px] grid-cols-3 gap-1">
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center justify-center rounded-xl px-2 py-2 text-center text-[11px] font-semibold tracking-[0.08em] transition-none",
                  pathname.startsWith(item.href)
                    ? "bg-[var(--surface-soft)] text-[var(--accent)]"
                    : "text-[var(--text-muted)]",
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
