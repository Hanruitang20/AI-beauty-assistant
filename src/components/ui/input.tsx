import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full min-h-11 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-rose-900 shadow-sm outline-none transition placeholder:text-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200",
        props.className,
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full min-h-11 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-rose-900 shadow-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-rose-900 shadow-sm outline-none transition placeholder:text-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200",
        props.className,
      )}
    />
  );
}
