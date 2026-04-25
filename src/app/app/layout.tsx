"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { ToastProvider } from "@/components/ui/toast-provider";
import { isSignedIn } from "@/lib/mock-auth";

export default function InternalAppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSignedIn()) {
      router.replace("/auth/sign-in");
      return;
    }
    setReady(true);
  }, [router, pathname]);

  if (!ready) return null;

  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
