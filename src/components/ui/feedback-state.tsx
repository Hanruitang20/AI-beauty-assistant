import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FeedbackTone = "success" | "error" | "info" | "warning";

const toneClass: Record<FeedbackTone, string> = {
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  error: "border-red-100 bg-red-50 text-red-700",
  info: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
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
