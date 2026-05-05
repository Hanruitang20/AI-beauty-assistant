import { createSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = signInSchema.safeParse({
      email: typeof json?.email === "string" ? normalizeEmail(json.email) : "",
      password: typeof json?.password === "string" ? json.password : "",
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    const email = normalizeEmail(parsed.data.email);
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    await createSessionCookie(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[AuthDiagnostics] signin route failed.");
      if (error instanceof Error) {
        console.error("[AuthDiagnostics] signin error:", error.message);
      }
    }
    return NextResponse.json({ error: "signin_failed" }, { status: 500 });
  }
}
