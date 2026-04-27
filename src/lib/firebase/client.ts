import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

type FirebaseClientState = {
  app: FirebaseApp | null;
  auth: Auth | null;
  error: Error | null;
};

let firebaseClientState: FirebaseClientState | null = null;

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

function getMissingFirebaseEnvKeys(config: ReturnType<typeof getFirebaseConfig>) {
  const missing: string[] = [];
  if (!config.apiKey) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!config.authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!config.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!config.appId) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");
  return missing;
}

function initFirebaseClientState(): FirebaseClientState {
  const firebaseConfig = getFirebaseConfig();
  const missingKeys = getMissingFirebaseEnvKeys(firebaseConfig);
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
        : initializeApp(firebaseConfig);

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
