export type AssessmentProfileDraft = {
  skinType: string;
  skinConcerns: string;
  experienceLevel: string;
  skincareFamiliarity: string;
  ingredientsToAvoid: string;
};

const DRAFT_KEY = "beautyshelf.profile-draft";

function hasWindow() {
  return typeof window !== "undefined";
}

export function saveProfileDraft(draft: AssessmentProfileDraft) {
  if (!hasWindow()) return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function getProfileDraft(): AssessmentProfileDraft | null {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AssessmentProfileDraft;
  } catch {
    return null;
  }
}

export function clearProfileDraft() {
  if (!hasWindow()) return;
  window.localStorage.removeItem(DRAFT_KEY);
}
