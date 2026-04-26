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
      draft.skincareFamiliarity?.trim() ||
      draft.ingredientsToAvoid?.trim(),
  );
}

export function deriveUserAppState(input: {
  isSignedIn: boolean;
  products: BeautyProduct[];
  profile: SavedProfile | null;
  assessmentDraft: AssessmentProfileDraft | null;
}): UserAppState {
  const productCount = input.products.length;
  const hasProfile = Boolean(input.profile);
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
