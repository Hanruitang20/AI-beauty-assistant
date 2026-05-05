"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MobileAppFrame } from "@/components/layout/mobile-app-frame";
import { isSignedInAsync } from "@/lib/auth-service";
import { ToastProvider } from "@/components/ui/toast-provider";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkAuth() {
      try {
        const signedIn = await isSignedInAsync();
        if (!active) return;
        if (signedIn) {
          router.replace("/app/products");
          return;
        }
        setReady(true);
      } catch {
        if (!active) return;
        // If auth check fails, allow auth pages to render instead of white screen.
        setReady(true);
      }
    }
    void checkAuth();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!ready) return <div className="sr-only">加载中...</div>;

  return (
    <ToastProvider>
      <MobileAppFrame>
        <div className="min-h-screen bg-[var(--background)] px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
          <div className="mx-auto w-full max-w-sm space-y-6">
            <div className="space-y-1 text-center">
              <Link href="/" className="editorial-heading text-2xl font-semibold italic tracking-tight text-[#3c3530]">
                BeautyShelf AI
              </Link>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
                你的温和护肤整理与决策助手
              </p>
            </div>
            {children}
          </div>
        </div>
      </MobileAppFrame>
    </ToastProvider>
  );
}
