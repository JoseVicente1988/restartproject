import { NextResponse } from "next/server";
import { rateLimitOk } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import { login } from "@/lib/auth";

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0] || "unknown";
  if (!rateLimitOk(ip, true)) return NextResponse.json({ ok:false, error:"Too many requests" }, { status:429 });

  try {
    const data = loginSchema.parse(await req.json());
    await login(data.email, data.password);
    return NextResponse.json({ ok:true });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error:"Invalid credentials" }, { status:401 });
  }
}
