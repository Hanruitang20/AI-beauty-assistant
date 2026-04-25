"use client";

export const MOCK_AUTH_KEY = "beautyshelf.mock-auth";
const MOCK_USER_KEY = "beautyshelf.mock-user";

export type MockUser = {
  name: string;
  email: string;
  id: string;
};

export function isSignedIn() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MOCK_AUTH_KEY) === "signed-in";
}

export function signInMock(user: MockUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOCK_AUTH_KEY, "signed-in");
  window.localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
}

export function signOutMock() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MOCK_AUTH_KEY);
  window.localStorage.removeItem(MOCK_USER_KEY);
}

export function getMockUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(MOCK_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MockUser;
  } catch {
    return null;
  }
}
