import Link from "next/link";
import { ReactNode } from "react";
import { MobileAppFrame } from "@/components/layout/mobile-app-frame";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <MobileAppFrame>
      <div className="min-h-[calc(100vh-2rem)] bg-[var(--background)] px-5 pb-8 pt-10">
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
  );
}
