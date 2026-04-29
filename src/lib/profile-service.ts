import { dataSource } from "@/lib/data-source";
import {
  clearProfileDraft as clearStoredProfileDraft,
  getProfileDraft as getStoredProfileDraft,
  saveProfileDraft as saveStoredProfileDraft,
} from "@/lib/profile-draft";
import { getSavedProfile, saveProfile as saveStoredProfile, SavedProfile } from "@/lib/profile-store";
import { getScopedStorageKey, getScopedStorageKeyWithLegacyMigration } from "@/lib/storage-scope";
import { hasValidProfile } from "@/lib/user-state";

const PROFILE_AVATAR_KEY = "profile-avatar";
const LEGACY_AVATAR_KEYS = ["beautyshelf.mock-user-avatar"];

function hasWindow() {
  return typeof window !== "undefined";
}

export function getProfile() {
  return getSavedProfile();
}

export async function getProfileAsync() {
  return dataSource.profile.getProfile();
}

export function saveProfile(profile: SavedProfile) {
  saveStoredProfile(profile);
}

export async function saveProfileAsync(profile: SavedProfile) {
  await dataSource.profile.saveProfile(profile);
}

export function getProfileDraft() {
  return getStoredProfileDraft();
}

export async function getProfileDraftAsync() {
  return dataSource.profile.getDraft();
}

export function saveProfileDraft(draft: Parameters<typeof saveStoredProfileDraft>[0]) {
  saveStoredProfileDraft(draft);
}

export async function saveProfileDraftAsync(draft: Parameters<typeof saveStoredProfileDraft>[0]) {
  await dataSource.profile.saveDraft(draft);
}

export function clearProfileDraft() {
  clearStoredProfileDraft();
}

export async function clearProfileDraftAsync() {
  await dataSource.profile.clearDraft();
}

export function hasProfile() {
  return hasValidProfile(getSavedProfile());
}

export async function hasProfileAsync() {
  const profile = await dataSource.profile.getProfile();
  return hasValidProfile(profile);
}

export function getUserAvatar() {
  if (!hasWindow()) return "";
  const scopedKey = getScopedStorageKeyWithLegacyMigration(PROFILE_AVATAR_KEY, LEGACY_AVATAR_KEYS);
  if (!scopedKey) return "";
  return window.localStorage.getItem(scopedKey) || "";
}

export async function getUserAvatarAsync() {
  return dataSource.profile.getAvatar();
}

export function saveUserAvatar(value: string) {
  if (!hasWindow()) return;
  const scopedKey = getScopedStorageKey(PROFILE_AVATAR_KEY);
  if (!scopedKey) return;
  window.localStorage.setItem(scopedKey, value);
}

export async function saveUserAvatarAsync(value: string) {
  await dataSource.profile.saveAvatar(value);
}

export function clearUserAvatar() {
  if (!hasWindow()) return;
  const scopedKey = getScopedStorageKey(PROFILE_AVATAR_KEY);
  if (!scopedKey) return;
  window.localStorage.removeItem(scopedKey);
}

export async function clearUserAvatarAsync() {
  await dataSource.profile.clearAvatar();
}
