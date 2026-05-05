import { CURRENT_DATA_SOURCE_MODE } from "@/lib/data-source";
import { CURRENT_AUTH_PROVIDER, authService } from "@/lib/auth/auth-service";
import type { AuthUser as UnifiedAuthUser } from "@/lib/auth/types";
import { localAuthRepository } from "@/lib/local/local-auth-repository";
import { getMockUser, isSignedIn as isSignedInMock, MockUser, signInMock, signOutMock } from "@/lib/mock-auth";

export type AuthUser = MockUser & { password?: string };

function fromUnifiedUser(user: UnifiedAuthUser): MockUser {
  const email = user.email || "";
  return {
    id: user.id,
    email,
    name: email.split("@")[0] || "BeautyShelf 用户",
  };
}

export function signIn(user: AuthUser) {
  signInMock(user);
}

export async function signInAsync(user: AuthUser) {
  if (CURRENT_DATA_SOURCE_MODE === "remote") {
    await authService.signIn(user.email, user.password || "");
    if (process.env.NODE_ENV !== "production") {
      console.info("[AuthDiagnostics] signIn via provider", {
        authProvider: CURRENT_AUTH_PROVIDER,
        dataSource: CURRENT_DATA_SOURCE_MODE,
      });
    }
    return;
  }
  await localAuthRepository.signIn(user);
}

export function signUp(user: AuthUser) {
  // Mock sign-up keeps the same behavior as sign-in.
  signInMock(user);
}

export async function signUpAsync(user: AuthUser) {
  if (CURRENT_DATA_SOURCE_MODE === "remote") {
    await authService.signUp(user.email, user.password || "");
    if (process.env.NODE_ENV !== "production") {
      console.info("[AuthDiagnostics] signUp via provider", {
        authProvider: CURRENT_AUTH_PROVIDER,
        dataSource: CURRENT_DATA_SOURCE_MODE,
      });
    }
    return;
  }
  await localAuthRepository.signUp(user);
}

export function signOut() {
  signOutMock();
}

export async function signOutAsync() {
  if (CURRENT_DATA_SOURCE_MODE === "remote") {
    await authService.signOut();
    if (typeof window !== "undefined") {
      // Clear stale local mock auth markers on provider signout.
      signOutMock();
    }
    return;
  }
  await localAuthRepository.signOut();
}

export function getCurrentUser() {
  return getMockUser();
}

export async function getCurrentUserAsync() {
  if (CURRENT_DATA_SOURCE_MODE === "remote") {
    const user = await authService.getCurrentUser();
    return user ? fromUnifiedUser(user) : null;
  }
  return localAuthRepository.getCurrentUser();
}

export function isSignedIn() {
  return isSignedInMock();
}

export async function isSignedInAsync() {
  if (CURRENT_DATA_SOURCE_MODE === "remote") {
    const user = await authService.getCurrentUser();
    return Boolean(user);
  }
  return localAuthRepository.isSignedIn();
}
