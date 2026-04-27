import { getScopedStorageKey, getScopedStorageKeyWithLegacyMigration } from "@/lib/storage-scope";

export type SavedProfile = {
  primaryFocus: string;
  skinType: string;
  mainConcerns: string;
  sensitivityLevel: string;
  preferredBrands: string[];
  dislikedBrands: string[];
  experienceLevel: string;
  skincareFamiliarity: string;
  hasRoutine: string;
  priorityGoal: string;
};

const PROFILE_KEY = "profile";

function hasWindow() {
  return typeof window !== "undefined";
}

export function getSavedProfile(): SavedProfile | null {
  if (!hasWindow()) return null;
  const profileKey = getScopedStorageKeyWithLegacyMigration(PROFILE_KEY, ["beautyshelf.profile"]);
  if (!profileKey) return null;
  const raw = window.localStorage.getItem(profileKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: SavedProfile) {
  if (!hasWindow()) return;
  const profileKey = getScopedStorageKey(PROFILE_KEY);
  if (!profileKey) return;
  window.localStorage.setItem(profileKey, JSON.stringify(profile));
}
