"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MobileAppFrameProps = {
  children: ReactNode;
  className?: string;
};

export function MobileAppFrame({ children, className }: MobileAppFrameProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] px-3 py-4 md:px-6 md:py-6">
      <div
        className={cn(
          "mx-auto min-h-[calc(100vh-2rem)] w-full max-w-[430px] overflow-hidden rounded-[28px] border bg-[var(--surface)] shadow-[0_24px_80px_-48px_rgba(58,52,47,0.34)]",
          className,
        )}
        style={{ borderColor: "var(--border-soft)" }}
      >
        {children}
      </div>
    </div>
  );
}
