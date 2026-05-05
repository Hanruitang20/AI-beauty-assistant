"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MobileAppFrameProps = {
  children: ReactNode;
  className?: string;
};

export function MobileAppFrame({ children, className }: MobileAppFrameProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] md:px-6 md:py-6">
      <div
        className={cn(
          "mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[var(--surface)] md:min-h-[calc(100vh-3rem)] md:rounded-[28px] md:border md:shadow-[0_24px_80px_-48px_rgba(58,52,47,0.34)]",
          className,
        )}
        style={{ borderColor: "var(--border-soft)" }}
      >
        {children}
      </div>
    </div>
  );
}
