import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] shadow-sm disabled:opacity-50 active:scale-[0.99]",
  secondary:
    "bg-[var(--surface)] border text-[var(--foreground)] hover:bg-[var(--surface-soft)] disabled:opacity-50 active:scale-[0.99]",
  ghost: "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] active:scale-[0.99]",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm disabled:bg-red-300 active:scale-[0.99]",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed",
        variantClassMap[variant],
        className,
      )}
      style={variant === "secondary" ? { borderColor: "var(--border-soft)" } : undefined}
      {...props}
    />
  );
}
