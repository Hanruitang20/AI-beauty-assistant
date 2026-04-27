import { AssessmentProfileDraft } from "@/lib/profile-draft";
import { SavedProfile } from "@/lib/profile-store";

export interface ProfileRepository {
  getProfile(): Promise<SavedProfile | null>;
  saveProfile(profile: SavedProfile): Promise<void>;
  getDraft(): Promise<AssessmentProfileDraft | null>;
  saveDraft(draft: AssessmentProfileDraft): Promise<void>;
  clearDraft(): Promise<void>;
  getAvatar(): Promise<string>;
  saveAvatar(value: string): Promise<void>;
  clearAvatar(): Promise<void>;
}
