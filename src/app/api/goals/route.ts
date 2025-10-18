// src/app/api/goals/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { z } from "zod";

const goalCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  target_date: z.string().datetime().optional().nullable(),
});

function json(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }

export async function GET() {
  const u = await currentUser();
  if (!u) return json({ ok: false, error: "Unauthorized" }, 401);
  const me = BigInt(u.id);

  const rows = await prisma.goal.findMany({
    where: { userId: me },
    orderBy: { id: "asc" },
  });

  const goals = rows.map(g => ({
    id: g.id.toString(),
    userId: g.userId.toString(),
    title: g.title,
    targetDate: g.targetDate ? g.targetDate.toISOString() : null,
    isPublic: g.isPublic,
    createdAt: g.createdAt.toISOString(),
  }));

  return json({ ok: true, goals });
}

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u) return json({ ok: false, error: "Unauthorized" }, 401);
  const me = BigInt(u.id);

  let body: any = {};
  try { body = await req.json(); } catch {}

  const data = goalCreateSchema.safeParse(body);
  if (!data.success) return json({ ok: false, error: "Bad request" }, 400);

  const g = await prisma.goal.create({
    data: {
      userId: me,
      title: data.data.title,
      targetDate: data.data.target_date ? new Date(data.data.target_date) : null,
    },
  });

  return json({ ok: true, goal_id: g.id.toString() }, 201);
}
