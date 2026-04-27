"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { ToastProvider } from "@/components/ui/toast-provider";
import { isSignedInAsync } from "@/lib/auth-service";
import { cleanupCurrentUserLocalData, cleanupLegacyMockLocalData } from "@/lib/dev-cleanup";

export default function InternalAppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (
      window as typeof window & {
        cleanupLegacyMockLocalData?: typeof cleanupLegacyMockLocalData;
        cleanupCurrentUserLocalData?: typeof cleanupCurrentUserLocalData;
      }
    ).cleanupLegacyMockLocalData = cleanupLegacyMockLocalData;
    (
      window as typeof window & {
        cleanupLegacyMockLocalData?: typeof cleanupLegacyMockLocalData;
        cleanupCurrentUserLocalData?: typeof cleanupCurrentUserLocalData;
      }
    ).cleanupCurrentUserLocalData = cleanupCurrentUserLocalData;
  }, []);

  useEffect(() => {
    let active = true;
    async function checkAuth() {
      try {
        const signedIn = await isSignedInAsync();
        if (!active) return;
        if (!signedIn) {
          router.replace("/auth/login");
          return;
        }
        setReady(true);
      } catch {
        if (!active) return;
        router.replace("/auth/login");
      }
    }
    void checkAuth();
    return () => {
      active = false;
    };
  }, [router, pathname]);

  if (!ready) return <div className="sr-only">加载中...</div>;

  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
