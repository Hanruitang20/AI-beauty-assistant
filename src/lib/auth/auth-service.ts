"use client";

import { customAuthClient } from "@/lib/auth/custom-auth-client";
import { firebaseAuthClient } from "@/lib/auth/firebase-auth-client";
import { AuthService, AuthUser } from "@/lib/auth/types";
import { CURRENT_DATA_SOURCE_MODE } from "@/lib/data-source";

export type { AuthUser };

function resolveAuthProvider() {
  const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER;
  if (!provider) return "custom";
  return provider === "firebase" ? "firebase" : "custom";
}

export const CURRENT_AUTH_PROVIDER = resolveAuthProvider();

function getProviderService(): AuthService {
  return CURRENT_AUTH_PROVIDER === "firebase" ? firebaseAuthClient : customAuthClient;
}

const provider = getProviderService();

if (process.env.NODE_ENV !== "production") {
  console.info("[AuthDiagnostics] provider =", CURRENT_AUTH_PROVIDER);
  if (typeof window !== "undefined") {
    const win = window as Window & {
      getBeautyShelfAuthDebug?: () => Promise<{
        authProvider: string;
        dataSource: string;
        hasAuthUser: boolean;
        userId: string | null;
        email: string | null;
      }>;
    };
    win.getBeautyShelfAuthDebug = async () => {
      const user = await authService.getCurrentUser();
      return {
        authProvider: CURRENT_AUTH_PROVIDER,
        dataSource: CURRENT_DATA_SOURCE_MODE,
        hasAuthUser: Boolean(user),
        userId: user?.id || null,
        email: user?.email || null,
      };
    };
  }
}

export const authService: AuthService = {
  signUp: (email, password) => provider.signUp(email, password),
  signIn: (email, password) => provider.signIn(email, password),
  signOut: () => provider.signOut(),
  getCurrentUser: () => provider.getCurrentUser(),
  getCurrentUserId: () => provider.getCurrentUserId(),
  onAuthStateChanged: (callback) => provider.onAuthStateChanged(callback),
};

export async function signUp(email: string, password: string): Promise<AuthUser> {
  return authService.signUp(email, password);
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  return authService.signIn(email, password);
}

export async function signOut(): Promise<void> {
  return authService.signOut();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return authService.getCurrentUser();
}

export async function getCurrentUserId(): Promise<string | null> {
  return authService.getCurrentUserId();
}

export function onAuthStateChanged(callback: (user: AuthUser | null) => void) {
  return authService.onAuthStateChanged(callback);
}

declare global {
  interface Window {
    getBeautyShelfAuthDebug?: () => Promise<{
      authProvider: string;
      dataSource: string;
      hasAuthUser: boolean;
      userId: string | null;
      email: string | null;
    }>;
  }
}
