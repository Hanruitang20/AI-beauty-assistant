import { MockUser } from "@/lib/mock-auth";

export interface AuthRepository {
  isSignedIn(): Promise<boolean>;
  getCurrentUser(): Promise<MockUser | null>;
  signIn(user: MockUser): Promise<void>;
  signUp(user: MockUser): Promise<void>;
  signOut(): Promise<void>;
}
