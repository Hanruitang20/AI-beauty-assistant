import {
  clearProfileDraft as clearStoredProfileDraft,
  getProfileDraft as getStoredProfileDraft,
  saveProfileDraft as saveStoredProfileDraft,
} from "@/lib/profile-draft";
import { getSavedProfile, saveProfile as saveStoredProfile } from "@/lib/profile-store";
import { ProfileRepository } from "@/lib/repositories/profile-repository";
import { getScopedStorageKey, getScopedStorageKeyWithLegacyMigration } from "@/lib/storage-scope";

const MOCK_USER_AVATAR_KEY = "profile-avatar";

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
    const avatarKey = getScopedStorageKeyWithLegacyMigration(MOCK_USER_AVATAR_KEY, ["beautyshelf.mock-user-avatar"]);
    if (!avatarKey) return "";
    return window.localStorage.getItem(avatarKey) || "";
  },

  async saveAvatar(value) {
    if (!hasWindow()) return;
    const avatarKey = getScopedStorageKey(MOCK_USER_AVATAR_KEY);
    if (!avatarKey) return;
    window.localStorage.setItem(avatarKey, value);
  },

  async clearAvatar() {
    if (!hasWindow()) return;
    const avatarKey = getScopedStorageKey(MOCK_USER_AVATAR_KEY);
    if (!avatarKey) return;
    window.localStorage.removeItem(avatarKey);
  },
};
