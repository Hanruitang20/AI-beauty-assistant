"use client";

import { AuthService, AuthUser, normalizeAuthUserEmail } from "@/lib/auth/types";

type AuthApiResponse = {
  user: AuthUser | null;
};

const authListeners = new Set<(user: AuthUser | null) => void>();
let currentUserCache: AuthUser | null = null;
let initialized = false;
let bootstrapPromise: Promise<AuthUser | null> | null = null;

function notifyAuthListeners(user: AuthUser | null) {
  currentUserCache = user;
  authListeners.forEach((listener) => listener(user));
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    throw new Error("invalid_response");
  }
}

async function fetchCurrentUserFromServer() {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("auth_me_failed");
  }
  const data = await parseJsonResponse<AuthApiResponse>(res);
  const user = data.user
    ? {
        id: data.user.id,
        email: normalizeAuthUserEmail(data.user.email),
      }
    : null;
  notifyAuthListeners(user);
  return user;
}

async function postAuth(path: string, body: { email: string; password: string }) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await parseJsonResponse<AuthApiResponse>(res);
  if (!res.ok || !data.user) {
    const message =
      typeof (data as { error?: string }).error === "string"
        ? (data as { error?: string }).error
        : "auth_request_failed";
    throw new Error(message);
  }
  const user = {
    id: data.user.id,
    email: normalizeAuthUserEmail(data.user.email),
  };
  notifyAuthListeners(user);
  return user;
}

function ensureInit() {
  if (initialized) return;
  initialized = true;
  bootstrapPromise = fetchCurrentUserFromServer().catch(() => {
    notifyAuthListeners(null);
    return null;
  });
}

export function getCachedCustomAuthUserId() {
  ensureInit();
  return currentUserCache?.id || null;
}

export const customAuthClient: AuthService = {
  async signUp(email, password) {
    return postAuth("/api/auth/signup", { email, password });
  },

  async signIn(email, password) {
    return postAuth("/api/auth/signin", { email, password });
  },

  async signOut() {
    const res = await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("auth_signout_failed");
    }
    notifyAuthListeners(null);
  },

  async getCurrentUser() {
    ensureInit();
    try {
      return await fetchCurrentUserFromServer();
    } catch {
      notifyAuthListeners(null);
      return null;
    }
  },

  async getCurrentUserId() {
    const user = await this.getCurrentUser();
    return user?.id || null;
  },

  onAuthStateChanged(callback) {
    ensureInit();
    authListeners.add(callback);
    callback(currentUserCache);
    if (bootstrapPromise) {
      void bootstrapPromise.then((user) => {
        callback(user);
      });
    }
    return () => {
      authListeners.delete(callback);
    };
  },
};
