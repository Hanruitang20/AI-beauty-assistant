import { getFirebaseAuthClient } from "@/lib/firebase/client";
import { MockUser } from "@/lib/mock-auth";
import { AuthRepository } from "@/lib/repositories/auth-repository";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

type RemoteAuthInput = MockUser & { password?: string };

function getRemoteAuth() {
  const { auth, error } = getFirebaseAuthClient();
  if (!auth) {
    throw error || new Error("Remote auth is unavailable.");
  }
  return auth;
}

function getEmailAndPassword(input: RemoteAuthInput) {
  const email = input.email?.trim();
  const password = input.password?.trim();
  if (!email || !password) {
    throw new Error("Remote auth requires email and password.");
  }
  return { email, password };
}

function mapFirebaseUserToMockUser() {
  const auth = getRemoteAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return {
    id: user.uid,
    email: user.email || "",
    name: user.displayName || user.email?.split("@")[0] || "Firebase 用户",
  };
}

export const remoteAuthRepository: AuthRepository = {
  async isSignedIn() {
    const auth = getRemoteAuth();
    if (auth.currentUser) return true;

    return new Promise<boolean>((resolve) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          resolve(Boolean(user));
        },
        () => {
          unsubscribe();
          resolve(false);
        },
      );
      setTimeout(() => {
        unsubscribe();
        resolve(Boolean(auth.currentUser));
      }, 1200);
    });
  },

  async getCurrentUser() {
    return mapFirebaseUserToMockUser();
  },

  async signIn(input) {
    const auth = getRemoteAuth();
    const { email, password } = getEmailAndPassword(input as RemoteAuthInput);
    await signInWithEmailAndPassword(auth, email, password);
  },

  async signUp(input) {
    const auth = getRemoteAuth();
    const { email, password } = getEmailAndPassword(input as RemoteAuthInput);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (input.name?.trim() && credential.user.displayName !== input.name.trim()) {
      // Name update can be wired here in next phase.
    }
  },

  async signOut() {
    const auth = getRemoteAuth();
    await firebaseSignOut(auth);
  },
};
