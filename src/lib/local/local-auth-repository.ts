import { getMockUser, isSignedIn, signInMock, signOutMock } from "@/lib/mock-auth";
import { AuthRepository } from "@/lib/repositories/auth-repository";

export const localAuthRepository: AuthRepository = {
  async isSignedIn() {
    return isSignedIn();
  },

  async getCurrentUser() {
    return getMockUser();
  },

  async signIn(user) {
    signInMock(user);
  },

  async signUp(user) {
    signInMock(user);
  },

  async signOut() {
    signOutMock();
  },
};
