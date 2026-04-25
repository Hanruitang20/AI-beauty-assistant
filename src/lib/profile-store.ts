export type SavedProfile = {
  skinType: string;
  skinConcerns: string;
  budgetRange: string;
  ingredientsToAvoid: string;
  fragrancePreference: string;
  preferredBrands: string[];
  dislikedBrands: string[];
  experienceLevel: string;
  skincareFamiliarity: string;
};

const PROFILE_KEY = "beautyshelf.profile";

function hasWindow() {
  return typeof window !== "undefined";
}

export function getSavedProfile(): SavedProfile | null {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: SavedProfile) {
  if (!hasWindow()) return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
