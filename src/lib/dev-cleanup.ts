"use client";

import { getFirebaseAuthClient } from "@/lib/firebase/client";

const LEGACY_MOCK_DATA_KEYS = [
  "products",
  "product-images",
  "recent-viewed-products",
  "profile",
  "profile-draft",
  "profile-avatar",
  "beautyshelf.products",
  "beautyshelf.product-images",
  "beautyshelf.recent-viewed-products",
  "beautyshelf.profile",
  "beautyshelf.profile-draft",
  "beautyshelf.mock-user-avatar",
  "beautyShelf:mock-user:products",
  "beautyShelf:mock-user:product-images",
  "beautyShelf:mock-user:recent-viewed-products",
  "beautyShelf:mock-user:profile",
  "beautyShelf:mock-user:profile-draft",
  "beautyShelf:mock-user:profile-avatar",
] as const;

const CURRENT_USER_SCOPED_BASE_KEYS = [
  "products",
  "product-images",
  "recent-viewed-products",
  "profile",
  "profile-draft",
  "profile-avatar",
  "product-experiences",
] as const;

export function cleanupLegacyMockLocalData() {
  if (typeof window === "undefined") {
    return { removedKeys: [] as string[], removedCount: 0 };
  }

  const removedKeys: string[] = [];
  for (const key of LEGACY_MOCK_DATA_KEYS) {
    if (window.localStorage.getItem(key) !== null) {
      window.localStorage.removeItem(key);
      removedKeys.push(key);
    }
  }

  return {
    removedKeys,
    removedCount: removedKeys.length,
  };
}

export function cleanupCurrentUserLocalData() {
  if (typeof window === "undefined") {
    return { removedKeys: [] as string[], removedCount: 0 };
  }
  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== "remote") {
    return { removedKeys: [] as string[], removedCount: 0 };
  }

  const { auth } = getFirebaseAuthClient();
  const uid = auth?.currentUser?.uid;
  if (!uid) {
    return { removedKeys: [] as string[], removedCount: 0 };
  }

  const removedKeys: string[] = [];
  for (const baseKey of CURRENT_USER_SCOPED_BASE_KEYS) {
    const scopedKey = `beautyShelf:${uid}:${baseKey}`;
    if (window.localStorage.getItem(scopedKey) !== null) {
      window.localStorage.removeItem(scopedKey);
      removedKeys.push(scopedKey);
    }
  }

  return {
    removedKeys,
    removedCount: removedKeys.length,
  };
}
