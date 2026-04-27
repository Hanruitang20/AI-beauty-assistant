import { AUTH_DATA_SOURCE_MODE, dataSource } from "@/lib/data-source";
import { localAuthRepository } from "@/lib/local/local-auth-repository";
import { getMockUser, isSignedIn as isSignedInMock, MockUser, signInMock, signOutMock } from "@/lib/mock-auth";

export type AuthUser = MockUser & { password?: string };

export function signIn(user: AuthUser) {
  signInMock(user);
}

export async function signInAsync(user: AuthUser) {
  if (AUTH_DATA_SOURCE_MODE === "remote") {
    await dataSource.auth.signIn(user);
    return;
  }
  await localAuthRepository.signIn(user);
}

export function signUp(user: AuthUser) {
  // Mock sign-up keeps the same behavior as sign-in.
  signInMock(user);
}

export async function signUpAsync(user: AuthUser) {
  if (AUTH_DATA_SOURCE_MODE === "remote") {
    await dataSource.auth.signUp(user);
    return;
  }
  await localAuthRepository.signUp(user);
}

export function signOut() {
  signOutMock();
}

export async function signOutAsync() {
  if (AUTH_DATA_SOURCE_MODE === "remote") {
    await dataSource.auth.signOut();
    return;
  }
  await localAuthRepository.signOut();
}

export function getCurrentUser() {
  return getMockUser();
}

export async function getCurrentUserAsync() {
  if (AUTH_DATA_SOURCE_MODE === "remote") {
    return dataSource.auth.getCurrentUser();
  }
  return localAuthRepository.getCurrentUser();
}

export function isSignedIn() {
  return isSignedInMock();
}

export async function isSignedInAsync() {
  if (AUTH_DATA_SOURCE_MODE === "remote") {
    return dataSource.auth.isSignedIn();
  }
  return localAuthRepository.isSignedIn();
}
