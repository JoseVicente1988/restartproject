import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const norm = (email || "").toString().trim().toLowerCase();
    if (!norm) return NextResponse.json({ ok: false, error: "Email requerido" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: norm },
      select: { securityQuestion: true }
    });

    // No revelamos si el email existe: devolvemos question si la hay; si no, null.
    return NextResponse.json({
      ok: true,
      question: user?.securityQuestion ?? null
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
