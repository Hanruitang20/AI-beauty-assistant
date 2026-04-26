"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { consumeQueuedToast } from "@/lib/flash-toast";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastInput = {
  message: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const toastToneClass: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-[var(--border-soft)] bg-[var(--surface)] text-[var(--foreground)]",
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(({ message, tone = "info" }: ToastInput) => {
    const next: ToastItem = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      message,
      tone,
    };

    setToasts((prev) => [...prev, next]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== next.id));
    }, 2800);
  }, []);

  useEffect(() => {
    const queued = consumeQueuedToast();
    if (queued) {
      const timer = window.setTimeout(() => showToast(queued), 0);
      return () => window.clearTimeout(timer);
    }
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn("rounded-xl border px-3 py-2 text-sm shadow-sm backdrop-blur", toastToneClass[toast.tone])}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
