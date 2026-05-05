export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthService = {
  signUp(email: string, password: string): Promise<AuthUser>;
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  getCurrentUserId(): Promise<string | null>;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
};

export function normalizeAuthUserEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return normalized || null;
}
