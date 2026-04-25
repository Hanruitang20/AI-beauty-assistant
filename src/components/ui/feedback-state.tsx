import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FeedbackTone = "success" | "error" | "info" | "warning";

const toneClass: Record<FeedbackTone, string> = {
  success: "border-emerald-200 bg-emerald-50/80 text-emerald-800",
  error: "border-red-200 bg-red-50/80 text-red-800",
  info: "border-[var(--border-soft)] bg-[var(--surface-soft)] text-[var(--text-muted)]",
  warning: "border-amber-200 bg-amber-50/80 text-amber-800",
};

type FeedbackStateProps = {
  tone?: FeedbackTone;
  children: ReactNode;
  className?: string;
};

export function FeedbackState({ tone = "info", children, className }: FeedbackStateProps) {
  return (
    <p className={cn("rounded-xl border px-3 py-2.5 text-sm leading-6", toneClass[tone], className)}>
      {children}
    </p>
  );
}
