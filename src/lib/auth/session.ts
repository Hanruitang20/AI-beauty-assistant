import { prisma } from "@/lib/db/prisma";
import { AuthUser } from "@/lib/auth/types";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "beautyShelf_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[AuthDiagnostics] AUTH_SESSION_SECRET missing or too short (minimum 32 chars).");
    }
    throw new Error("AUTH_SESSION_SECRET is missing or shorter than 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

async function signSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSessionSecret());
  const userId = typeof payload.userId === "string" ? payload.userId : null;
  return userId;
}

function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function createSessionCookie(userId: string) {
  const store = await cookies();
  const token = await signSessionToken({ userId });
  const options = getSessionCookieOptions();
  store.set(options.name, token, {
    httpOnly: options.httpOnly,
    sameSite: options.sameSite,
    path: options.path,
    maxAge: options.maxAge,
    secure: options.secure,
  });
}

export async function getSessionUserId() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getCurrentSessionUser(): Promise<AuthUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user) return null;
  return { id: user.id, email: user.email };
}
