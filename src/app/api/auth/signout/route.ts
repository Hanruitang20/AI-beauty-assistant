import { clearSessionCookie } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "signout_failed" }, { status: 500 });
  }
}
