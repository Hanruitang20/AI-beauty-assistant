import { BeautyProduct } from "@/lib/products";
import { AssessmentProfileDraft } from "@/lib/profile-draft";
import { SavedProfile } from "@/lib/profile-store";

export type UserAppState = {
  isSignedIn: boolean;
  productCount: number;
  hasProfile: boolean;
  hasAssessmentDraft: boolean;
  isFirstSignedInUser: boolean;
  hasProfileNoProducts: boolean;
  hasOneProduct: boolean;
  hasMultipleProducts: boolean;
};

export function hasValidAssessmentDraft(draft: AssessmentProfileDraft | null) {
  if (!draft) return false;
  return Boolean(
    draft.skinType?.trim() ||
      draft.skinConcerns?.trim() ||
      draft.experienceLevel?.trim() ||
      draft.skincareFamiliarity?.trim(),
  );
}

const PROFILE_EXCLUDED_KEYS = new Set([
  "id",
  "userId",
  "createdAt",
  "updatedAt",
  "metadata",
  "avatar",
  "name",
  "email",
]);

const INVALID_STRING_VALUES = new Set([
  "",
  "未填写",
  "unknown",
  "none",
  "unset",
  "not_set",
]);

function isValidStringValue(value: string) {
  const normalized = value.trim();
  if (!normalized) return false;
  const normalizedLower = normalized.toLowerCase();
  return !INVALID_STRING_VALUES.has(normalizedLower) && !INVALID_STRING_VALUES.has(normalized);
}

function countValidProfileFields(value: unknown, currentKey?: string): number {
  if (currentKey && PROFILE_EXCLUDED_KEYS.has(currentKey)) return 0;
  if (value == null) return 0;

  if (typeof value === "string") {
    return isValidStringValue(value) ? 1 : 0;
  }

  if (Array.isArray(value)) {
    const hasAnyValidItem = value.some((item) => countValidProfileFields(item) > 0);
    return hasAnyValidItem ? 1 : 0;
  }

  if (typeof value === "boolean") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? 1 : 0;
  if (typeof value !== "object") return 0;

  return Object.entries(value as Record<string, unknown>).reduce((acc, [key, childValue]) => {
    if (PROFILE_EXCLUDED_KEYS.has(key)) return acc;
    return acc + countValidProfileFields(childValue, key);
  }, 0);
}

export function hasValidProfile(profile: SavedProfile | null) {
  return countValidProfileFields(profile) >= 2;
}

export function deriveUserAppState(input: {
  isSignedIn: boolean;
  products: BeautyProduct[];
  profile: SavedProfile | null;
  assessmentDraft: AssessmentProfileDraft | null;
}): UserAppState {
  const productCount = input.products.length;
  const hasProfile = hasValidProfile(input.profile);
  const hasAssessmentDraft = hasValidAssessmentDraft(input.assessmentDraft);

  return {
    isSignedIn: input.isSignedIn,
    productCount,
    hasProfile,
    hasAssessmentDraft,
    isFirstSignedInUser: input.isSignedIn && productCount === 0 && !hasProfile && !hasAssessmentDraft,
    hasProfileNoProducts: input.isSignedIn && productCount === 0 && hasProfile,
    hasOneProduct: input.isSignedIn && productCount === 1,
    hasMultipleProducts: input.isSignedIn && productCount >= 2,
  };
}
