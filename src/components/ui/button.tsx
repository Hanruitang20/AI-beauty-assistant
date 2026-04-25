import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    "bg-rose-500 text-white hover:bg-rose-600 shadow-sm disabled:bg-rose-300 active:scale-[0.99]",
  secondary:
    "bg-white text-rose-800 border border-rose-200 hover:bg-rose-50 disabled:text-rose-400 active:scale-[0.99]",
  ghost: "text-rose-700 hover:bg-rose-100/70 active:scale-[0.99]",
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
      {...props}
    />
  );
}
