import { dataSource } from "@/lib/data-source";
import { getMockUser, isSignedIn as isSignedInMock, MockUser, signInMock, signOutMock } from "@/lib/mock-auth";

export type AuthUser = MockUser;

export function signIn(user: AuthUser) {
  signInMock(user);
}

export async function signInAsync(user: AuthUser) {
  await dataSource.auth.signIn(user);
}

export function signUp(user: AuthUser) {
  // Mock sign-up keeps the same behavior as sign-in.
  signInMock(user);
}

export async function signUpAsync(user: AuthUser) {
  await dataSource.auth.signUp(user);
}

export function signOut() {
  signOutMock();
}

export async function signOutAsync() {
  await dataSource.auth.signOut();
}

export function getCurrentUser() {
  return getMockUser();
}

export async function getCurrentUserAsync() {
  return dataSource.auth.getCurrentUser();
}

export function isSignedIn() {
  return isSignedInMock();
}

export async function isSignedInAsync() {
  return dataSource.auth.isSignedIn();
}
