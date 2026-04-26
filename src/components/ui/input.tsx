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
  const { style, ...rest } = props;
  return (
    <select
      {...rest}
      className={cn(
        "w-full min-h-11 appearance-none rounded-xl border bg-[var(--surface)] bg-[length:14px_14px] bg-[position:right_0.85rem_center] bg-no-repeat px-3 py-2.5 pr-10 text-sm text-[var(--foreground)] shadow-sm outline-none transition focus:border-[var(--focus-ring)] focus:ring-2 focus:ring-[var(--focus-ring)]/40",
        rest.className,
      )}
      style={{
        borderColor: "var(--border-soft)",
        boxShadow: "0 2px 8px -6px rgba(58,52,47,0.3)",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%23877468' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        ...style,
      }}
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
