import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border bg-[var(--surface)] p-4 shadow-[0_16px_44px_-34px_rgba(58,52,47,0.26)] sm:p-5",
        className,
      )}
      style={{ borderColor: "var(--border-soft)" }}
    >
      {children}
    </section>
  );
}
