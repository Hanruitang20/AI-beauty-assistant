import { getCurrentSessionUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentSessionUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
