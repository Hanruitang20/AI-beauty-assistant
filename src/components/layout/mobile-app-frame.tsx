"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MobileAppFrameProps = {
  children: ReactNode;
  className?: string;
};

export function MobileAppFrame({ children, className }: MobileAppFrameProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-50 to-pink-100 px-3 py-4 md:px-6 md:py-6">
      <div
        className={cn(
          "mx-auto min-h-[calc(100vh-2rem)] w-full max-w-[430px] overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-[0_24px_80px_-40px_rgba(190,24,93,0.45)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
