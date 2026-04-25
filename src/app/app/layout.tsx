import { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { ToastProvider } from "@/components/ui/toast-provider";

export default function InternalAppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
