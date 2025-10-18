import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const RESET_TTL_MS = 60 * 60 * 1000; // 60 min

export async function POST(req: Request) {
  try {
    const { email, answer } = await req.json();
    const norm = (email || "").toString().trim().toLowerCase();
    const ans = (answer || "").toString().trim();
    if (!norm || !ans) return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: norm },
      select: { id: true, securityAnswerHash: true, securityQuestion: true }
    });

    // Seguridad: devolvemos 200/ok:false sin detallar si existe o no
    if (!user?.securityAnswerHash) {
      return NextResponse.json({ ok: false, error: "Respuesta incorrecta" }, { status: 200 });
    }

    const ok = bcrypt.compareSync(ans, user.securityAnswerHash);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Respuesta incorrecta" }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt }
    });

    return NextResponse.json({ ok: true, token, expiresAt: expiresAt.toISOString() });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
