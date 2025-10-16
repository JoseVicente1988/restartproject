import { NextResponse } from "next/server";
import { registerUser, signToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/cookies";

export async function POST(req: Request) {
  const { email, name, password } = await req.json();
  if (!email || !name || !password) return NextResponse.json({ error: "missing" }, { status: 400 });
  try {
    const user = await registerUser(email, name, password);
    const token = signToken({ id: user.id, email: user.email, name: user.name });
    setAuthCookie(token);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "register_failed" }, { status: 400 });
  }
}
