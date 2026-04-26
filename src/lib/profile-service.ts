import {
  clearProfileDraft as clearStoredProfileDraft,
  getProfileDraft as getStoredProfileDraft,
  saveProfileDraft as saveStoredProfileDraft,
} from "@/lib/profile-draft";
import { getSavedProfile, saveProfile as saveStoredProfile, SavedProfile } from "@/lib/profile-store";

const MOCK_USER_AVATAR_KEY = "beautyshelf.mock-user-avatar";

function hasWindow() {
  return typeof window !== "undefined";
}

export function getProfile() {
  return getSavedProfile();
}

export function saveProfile(profile: SavedProfile) {
  saveStoredProfile(profile);
}

export function getProfileDraft() {
  return getStoredProfileDraft();
}

export function saveProfileDraft(draft: Parameters<typeof saveStoredProfileDraft>[0]) {
  saveStoredProfileDraft(draft);
}

export function clearProfileDraft() {
  clearStoredProfileDraft();
}

export function hasProfile() {
  return Boolean(getSavedProfile());
}

export function getUserAvatar() {
  if (!hasWindow()) return "";
  return window.localStorage.getItem(MOCK_USER_AVATAR_KEY) || "";
}

export function saveUserAvatar(value: string) {
  if (!hasWindow()) return;
  window.localStorage.setItem(MOCK_USER_AVATAR_KEY, value);
}

export function clearUserAvatar() {
  if (!hasWindow()) return;
  window.localStorage.removeItem(MOCK_USER_AVATAR_KEY);
}
