import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import { createUser } from "@/lib/auth";
import { rateLimitOk } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0] || "unknown";
  if (!rateLimitOk(ip, true)) return NextResponse.json({ ok:false, error:"Too many requests" }, { status:429 });
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    await createUser(data.email, data.password, data.name ?? null);
    return NextResponse.json({ ok:true }, { status:201 });
  } catch (e: any) {
    const msg = e?.message ?? "Bad request";
    const code = /already/.test(msg) ? 409 : 400;
    return NextResponse.json({ ok:false, error: msg }, { status: code });
  }
}
