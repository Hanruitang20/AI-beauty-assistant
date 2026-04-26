import { getMockUser, isSignedIn as isSignedInMock, MockUser, signInMock, signOutMock } from "@/lib/mock-auth";

export type AuthUser = MockUser;

export function signIn(user: AuthUser) {
  signInMock(user);
}

export function signUp(user: AuthUser) {
  // Mock sign-up keeps the same behavior as sign-in.
  signInMock(user);
}

export function signOut() {
  signOutMock();
}

export function getCurrentUser() {
  return getMockUser();
}

export function isSignedIn() {
  return isSignedInMock();
}
