import { ProfileRepository } from "@/lib/repositories/profile-repository";

function notImplemented(): never {
  throw new Error("Remote data source is not implemented yet.");
}

export const remoteProfileRepository: ProfileRepository = {
  async getProfile() {
    return notImplemented();
  },
  async saveProfile() {
    return notImplemented();
  },
  async getDraft() {
    return notImplemented();
  },
  async saveDraft() {
    return notImplemented();
  },
  async clearDraft() {
    return notImplemented();
  },
  async getAvatar() {
    return notImplemented();
  },
  async saveAvatar() {
    return notImplemented();
  },
  async clearAvatar() {
    return notImplemented();
  },
};
