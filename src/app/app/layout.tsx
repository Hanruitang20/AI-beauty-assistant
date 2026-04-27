"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { ToastProvider } from "@/components/ui/toast-provider";
import { isSignedInAsync } from "@/lib/auth-service";

export default function InternalAppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkAuth() {
      const signedIn = await isSignedInAsync();
      if (!active) return;
      if (!signedIn) {
        router.replace("/auth/sign-in");
        return;
      }
      setReady(true);
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
