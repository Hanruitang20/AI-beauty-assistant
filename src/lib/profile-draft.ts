import { getScopedStorageKey, getScopedStorageKeyWithLegacyMigration } from "@/lib/storage-scope";

export type AssessmentProfileDraft = {
  skinType: string;
  skinConcerns: string;
  experienceLevel: string;
  skincareFamiliarity: string;
};

const DRAFT_KEY = "profile-draft";

function hasWindow() {
  return typeof window !== "undefined";
}

export function saveProfileDraft(draft: AssessmentProfileDraft) {
  if (!hasWindow()) return;
  const draftKey = getScopedStorageKeyWithLegacyMigration(DRAFT_KEY, ["beautyshelf.profile-draft"]);
  if (!draftKey) return;
  window.localStorage.setItem(draftKey, JSON.stringify(draft));
}

export function getProfileDraft(): AssessmentProfileDraft | null {
  if (!hasWindow()) return null;
  const draftKey = getScopedStorageKey(DRAFT_KEY);
  if (!draftKey) return null;
  const raw = window.localStorage.getItem(draftKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AssessmentProfileDraft;
  } catch {
    return null;
  }
}

export function clearProfileDraft() {
  if (!hasWindow()) return;
  const draftKey = getScopedStorageKey(DRAFT_KEY);
  if (!draftKey) return;
  window.localStorage.removeItem(draftKey);
}
