import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

type FirebaseClientState = {
  app: FirebaseApp | null;
  auth: Auth | null;
  error: Error | null;
};

const REQUIRED_FIREBASE_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

let firebaseClientState: FirebaseClientState | null = null;

function getMissingFirebaseEnvKeys() {
  return REQUIRED_FIREBASE_ENV_KEYS.filter((key) => !process.env[key]);
}

function initFirebaseClientState(): FirebaseClientState {
  const missingKeys = getMissingFirebaseEnvKeys();
  if (missingKeys.length) {
    return {
      app: null,
      auth: null,
      error: new Error(
        `Firebase env is incomplete. Missing: ${missingKeys.join(", ")}.`,
      ),
    };
  }

  try {
    const app =
      getApps().length > 0
        ? getApp()
        : initializeApp({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          });

    return {
      app,
      auth: getAuth(app),
      error: null,
    };
  } catch (error) {
    return {
      app: null,
      auth: null,
      error:
        error instanceof Error
          ? error
          : new Error("Failed to initialize Firebase client."),
    };
  }
}

export function getFirebaseAuthClient() {
  if (!firebaseClientState) {
    firebaseClientState = initFirebaseClientState();
  }
  return {
    auth: firebaseClientState.auth,
    error: firebaseClientState.error,
  };
}
