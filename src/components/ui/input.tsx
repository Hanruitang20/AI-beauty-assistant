import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full min-h-11 rounded-xl border bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] shadow-sm outline-none transition placeholder:text-[var(--text-muted)]/70 focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)]/40",
        props.className,
      )}
      style={{ borderColor: "var(--border-soft)", boxShadow: "0 2px 8px -6px rgba(58,52,47,0.3)" }}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full min-h-11 rounded-xl border bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] shadow-sm outline-none transition focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)]/40",
        props.className,
      )}
      style={{ borderColor: "var(--border-soft)", boxShadow: "0 2px 8px -6px rgba(58,52,47,0.3)" }}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] shadow-sm outline-none transition placeholder:text-[var(--text-muted)]/70 focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)]/40",
        props.className,
      )}
      style={{ borderColor: "var(--border-soft)", boxShadow: "0 2px 8px -6px rgba(58,52,47,0.3)" }}
    />
  );
}
