import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1) toca nada de negocio; solo preguntar algo mínimo al catálogo
    await prisma.$queryRaw`SELECT 1 as ok`;
    return NextResponse.json({ ok: true, db: "connected" });
  } catch (err: any) {
    // Devuelve el mensaje para que lo veas en el cliente
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  } finally {
    // no cierres prisma en serverless; aquí es safe por ser endpoint suelto
    try { await prisma.$disconnect(); } catch {}
  }
}
