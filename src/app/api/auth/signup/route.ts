import { createSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = signUpSchema.safeParse({
      email: typeof json?.email === "string" ? normalizeEmail(json.email) : "",
      password: typeof json?.password === "string" ? json.password : "",
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    const email = normalizeEmail(parsed.data.email);
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "email_exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });

    await createSessionCookie(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[AuthDiagnostics] signup route failed.");
      if (error instanceof Error) {
        console.error("[AuthDiagnostics] signup error:", error.message);
      }
    }
    return NextResponse.json({ error: "signup_failed" }, { status: 500 });
  }
}
