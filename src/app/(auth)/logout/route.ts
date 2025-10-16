import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/cookies";

// Soporta POST (botón/form) y GET (enlace directo)
export async function POST() {
  clearAuthCookie();
  return NextResponse.redirect(new URL("/ui", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"));
}

export async function GET() {
  clearAuthCookie();
  return NextResponse.redirect(new URL("/ui", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"));
}

// Evita cachear esta ruta en Vercel
export const dynamic = "force-dynamic";
