"use client";

import { getFirebaseAuthClient } from "@/lib/firebase/client";
import { AuthService, AuthUser, normalizeAuthUserEmail } from "@/lib/auth/types";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

function getAuthOrThrow() {
  const { auth, error } = getFirebaseAuthClient();
  if (!auth) throw error || new Error("firebase_auth_unavailable");
  return auth;
}

function mapFirebaseUser(): AuthUser | null {
  const auth = getAuthOrThrow();
  const user = auth.currentUser;
  if (!user) return null;
  return {
    id: user.uid,
    email: normalizeAuthUserEmail(user.email),
  };
}

export const firebaseAuthClient: AuthService = {
  async signUp(email, password) {
    const auth = getAuthOrThrow();
    const credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    return {
      id: credential.user.uid,
      email: normalizeAuthUserEmail(credential.user.email),
    };
  },

  async signIn(email, password) {
    const auth = getAuthOrThrow();
    const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    return {
      id: credential.user.uid,
      email: normalizeAuthUserEmail(credential.user.email),
    };
  },

  async signOut() {
    const auth = getAuthOrThrow();
    await firebaseSignOut(auth);
  },

  async getCurrentUser() {
    return mapFirebaseUser();
  },

  async getCurrentUserId() {
    return mapFirebaseUser()?.id || null;
  },

  onAuthStateChanged(callback) {
    const auth = getAuthOrThrow();
    const unsubscribe = onFirebaseAuthStateChanged(auth, (user) => {
      callback(
        user
          ? {
              id: user.uid,
              email: normalizeAuthUserEmail(user.email),
            }
          : null,
      );
    });
    return () => {
      unsubscribe();
    };
  },
};
