import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const { email, answer } = await req.json();

    if (!email || !answer)
      return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user)
      return NextResponse.json({ ok: false, error: "Usuario no encontrado" }, { status: 404 });

    if (!user.securityAnswerHash)
      return NextResponse.json({ ok: false, error: "El usuario no tiene respuesta de seguridad registrada" }, { status: 400 });

    const valid = await hashPassword(answer) === user.securityAnswerHash;
    if (!valid)
      return NextResponse.json({ ok: false, error: "Respuesta incorrecta" }, { status: 403 });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 min

    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
        method: "qa", // <-- aquí está la corrección
      },
    });

    return NextResponse.json({ ok: true, token, expiresAt: expiresAt.toISOString() });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message || "Server error" }, { status: 500 });
  }
}
