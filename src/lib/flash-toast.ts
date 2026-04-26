"use client";

type ToastTone = "success" | "error" | "info";

type ToastPayload = {
  message: string;
  tone?: ToastTone;
};

const FLASH_TOAST_KEY = "beautyshelf.flash-toast";

function hasWindow() {
  return typeof window !== "undefined";
}

export function queueToast(toast: ToastPayload) {
  if (!hasWindow()) return;
  window.sessionStorage.setItem(FLASH_TOAST_KEY, JSON.stringify(toast));
}

export function consumeQueuedToast(): ToastPayload | null {
  if (!hasWindow()) return null;
  const raw = window.sessionStorage.getItem(FLASH_TOAST_KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(FLASH_TOAST_KEY);
  try {
    return JSON.parse(raw) as ToastPayload;
  } catch {
    return null;
  }
}
