import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const PW_MIN = 8;
const PW_MAX = 72;

export async function POST(req: Request) {
  try {
    const { token, new_password } = await req.json();
    const t = (token || "").toString().trim();
    const pw = (new_password || "").toString();

    if (!t || !pw) return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 });
    if (pw.length < PW_MIN || pw.length > PW_MAX) {
      return NextResponse.json({ ok: false, error: "Password inválido" }, { status: 400 });
    }

    const reset = await prisma.passwordReset.findUnique({ where: { token: t } });
    if (!reset) return NextResponse.json({ ok: false, error: "Token inválido" }, { status: 400 });

    if (reset.expiresAt.getTime() < Date.now()) {
      await prisma.passwordReset.delete({ where: { token: t } });
      return NextResponse.json({ ok: false, error: "Token caducado" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: reset.userId } });
    if (!user) {
      await prisma.passwordReset.delete({ where: { token: t } });
      return NextResponse.json({ ok: false, error: "Token inválido" }, { status: 400 });
    }

    const passwordHash = bcrypt.hashSync(pw, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    // Limpieza: borra todos los tokens de ese usuario
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
