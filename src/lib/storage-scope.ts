"use client";

import { getFirebaseAuthClient } from "@/lib/firebase/client";
import { getMockUser } from "@/lib/mock-auth";

const LOCAL_FALLBACK_USER_ID = "mock-user";

function hasWindow() {
  return typeof window !== "undefined";
}

function isRemoteAuthMode() {
  return process.env.NEXT_PUBLIC_DATA_SOURCE === "remote";
}

export function getCurrentStorageScopeId(): string | null {
  if (!hasWindow()) return null;

  if (isRemoteAuthMode()) {
    const { auth } = getFirebaseAuthClient();
    return auth?.currentUser?.uid ?? null;
  }

  return getMockUser()?.id || LOCAL_FALLBACK_USER_ID;
}

export function getScopedStorageKey(baseKey: string): string | null {
  const scopeId = getCurrentStorageScopeId();
  if (!scopeId) return null;
  return `beautyShelf:${scopeId}:${baseKey}`;
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
