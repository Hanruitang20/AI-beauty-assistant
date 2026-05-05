"use client";

import { getCachedCustomAuthUserId } from "@/lib/auth/custom-auth-client";
import { CURRENT_AUTH_PROVIDER } from "@/lib/auth/auth-service";
import { getFirebaseAuthClient } from "@/lib/firebase/client";
import { getMockUser } from "@/lib/mock-auth";

function hasWindow() {
  return typeof window !== "undefined";
}

function isRemoteAuthMode() {
  return process.env.NEXT_PUBLIC_DATA_SOURCE !== "local";
}

function buildScopedStorageKey(scopeId: string, baseKey: string) {
  return `beautyShelf:${scopeId}:${baseKey}`;
}

export function getCurrentStorageScopeId(): string | null {
  if (!hasWindow()) return null;

  if (isRemoteAuthMode()) {
    if (CURRENT_AUTH_PROVIDER === "firebase") {
      const { auth } = getFirebaseAuthClient();
      const uid = auth?.currentUser?.uid ?? null;
      if (process.env.NODE_ENV !== "production") {
        console.info("[StorageScope] remote/firebase scope", { userId: uid });
      }
      return uid;
    }

    const userId = getCachedCustomAuthUserId();
    if (process.env.NODE_ENV !== "production") {
      console.info("[StorageScope] remote/custom scope", { userId });
    }
    return userId;
  }

  const mockUserId = getMockUser()?.id || "mock-user";
  if (process.env.NODE_ENV !== "production") {
    console.info("[StorageScope] local backup scope", { userId: mockUserId });
  }
  return mockUserId;
}

export function getScopedStorageKey(baseKey: string): string | null {
  const scopeId = getCurrentStorageScopeId();
  if (!scopeId) return null;
  return buildScopedStorageKey(scopeId, baseKey);
}

export function getScopedStorageKeyWithLegacyMigration(
  baseKey: string,
  legacyKeys: string[] = [],
): string | null {
  if (!hasWindow()) return null;

  const scopedKey = getScopedStorageKey(baseKey);
  if (!scopedKey) return null;

  if (isRemoteAuthMode()) return scopedKey;

  // Local/mock mode keeps the previous migration-compatible behavior.
  if (window.localStorage.getItem(scopedKey) !== null) return scopedKey;

  const candidateKeys = Array.from(new Set([baseKey, ...legacyKeys]));
  for (const legacyKey of candidateKeys) {
    if (!legacyKey || legacyKey === scopedKey) continue;
    const legacyValue = window.localStorage.getItem(legacyKey);
    if (legacyValue === null) continue;
    window.localStorage.setItem(scopedKey, legacyValue);
    break;
  }

  return scopedKey;
}

export function getStorageScopeDiagnostics() {
  const currentScope = getCurrentStorageScopeId();
  const keyFor = (baseKey: string) => (currentScope ? buildScopedStorageKey(currentScope, baseKey) : null);
  return {
    authProvider: CURRENT_AUTH_PROVIDER,
    dataSource: process.env.NEXT_PUBLIC_DATA_SOURCE || "remote",
    currentScope,
    profileKey: keyFor("profile"),
    productsKey: keyFor("products"),
    productExperiencesKey: keyFor("product-experiences"),
    metricsKey: keyFor("llm-quality-metrics"),
  };
}

if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  const win = window as Window & {
    getBeautyShelfStorageScopeDebug?: () => ReturnType<typeof getStorageScopeDiagnostics>;
  };
  win.getBeautyShelfStorageScopeDebug = getStorageScopeDiagnostics;
}

declare global {
  interface Window {
    getBeautyShelfStorageScopeDebug?: () => ReturnType<typeof getStorageScopeDiagnostics>;
  }
}
