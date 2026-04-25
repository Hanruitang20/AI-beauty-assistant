import Link from "next/link";
import { ReactNode } from "react";
import { MobileAppFrame } from "@/components/layout/mobile-app-frame";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <MobileAppFrame>
      <div className="min-h-[calc(100vh-2rem)] bg-gradient-to-b from-rose-50 via-white to-pink-50 px-5 pb-8 pt-10">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center">
            <Link href="/" className="text-xl font-semibold tracking-tight text-rose-900">
              BeautyShelf AI
            </Link>
            <p className="text-xs text-rose-700/80">
              你的温和护肤整理与决策助手
            </p>
          </div>
          {children}
        </div>
      </div>
    </MobileAppFrame>
  );
}
