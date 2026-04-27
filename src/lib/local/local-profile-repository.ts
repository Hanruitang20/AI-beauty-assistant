import {
  clearProfileDraft as clearStoredProfileDraft,
  getProfileDraft as getStoredProfileDraft,
  saveProfileDraft as saveStoredProfileDraft,
} from "@/lib/profile-draft";
import { getSavedProfile, saveProfile as saveStoredProfile } from "@/lib/profile-store";
import { ProfileRepository } from "@/lib/repositories/profile-repository";

const MOCK_USER_AVATAR_KEY = "beautyshelf.mock-user-avatar";

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
    return window.localStorage.getItem(MOCK_USER_AVATAR_KEY) || "";
  },

  async saveAvatar(value) {
    if (!hasWindow()) return;
    window.localStorage.setItem(MOCK_USER_AVATAR_KEY, value);
  },

  async clearAvatar() {
    if (!hasWindow()) return;
    window.localStorage.removeItem(MOCK_USER_AVATAR_KEY);
  },
};
