import { NextResponse } from "next/server";
import { authenticate, signToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/cookies";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "missing" }, { status: 400 });
  const user = await authenticate(email, password);
  if (!user) return NextResponse.json({ error: "invalid" }, { status: 401 });
  const token = signToken({ id: user.id, email: user.email, name: user.name });
  setAuthCookie(token);
  return NextResponse.json({ ok: true });
}
