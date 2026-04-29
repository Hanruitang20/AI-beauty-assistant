import {
  clearProfileDraft as clearStoredProfileDraft,
  getProfileDraft as getStoredProfileDraft,
  saveProfileDraft as saveStoredProfileDraft,
} from "@/lib/profile-draft";
import { getSavedProfile, saveProfile as saveStoredProfile } from "@/lib/profile-store";
import { getScopedStorageKey, getScopedStorageKeyWithLegacyMigration } from "@/lib/storage-scope";
import { ProfileRepository } from "@/lib/repositories/profile-repository";

const PROFILE_AVATAR_KEY = "profile-avatar";
const LEGACY_AVATAR_KEYS = ["beautyshelf.mock-user-avatar"];

function hasWindow() {
  return typeof window !== "undefined";
}

export const localProfileRepository: ProfileRepository = {
  async getProfile() {
    return getSavedProfile();
  },

  async saveProfile(profile) {
    saveStoredProfile(profile);
  },

  async getDraft() {
    return getStoredProfileDraft();
  },

  async saveDraft(draft) {
    saveStoredProfileDraft(draft);
  },

  async clearDraft() {
    clearStoredProfileDraft();
  },

  async getAvatar() {
    if (!hasWindow()) return "";
    const scopedKey = getScopedStorageKeyWithLegacyMigration(PROFILE_AVATAR_KEY, LEGACY_AVATAR_KEYS);
    if (!scopedKey) return "";
    return window.localStorage.getItem(scopedKey) || "";
  },

  async saveAvatar(value) {
    if (!hasWindow()) return;
    const scopedKey = getScopedStorageKey(PROFILE_AVATAR_KEY);
    if (!scopedKey) return;
    window.localStorage.setItem(scopedKey, value);
  },

  async clearAvatar() {
    if (!hasWindow()) return;
    const scopedKey = getScopedStorageKey(PROFILE_AVATAR_KEY);
    if (!scopedKey) return;
    window.localStorage.removeItem(scopedKey);
  },
};
