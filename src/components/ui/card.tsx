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
        "rounded-3xl border border-rose-100 bg-white/92 p-4 shadow-[0_20px_50px_-35px_rgba(190,24,93,0.35)] sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}
