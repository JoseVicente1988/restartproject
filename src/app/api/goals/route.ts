import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { goalCreateSchema } from "@/lib/validation";

export async function GET() {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const goals = await prisma.goal.findMany({ where: { userId: BigInt(u.id) }, orderBy: { id: "asc" } });
  return NextResponse.json({ ok:true, goals });
}

export async function POST(req: Request) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  try {
    const body = await req.json();
    const data = goalCreateSchema.parse(body);
    const g = await prisma.goal.create({
      data: { userId: BigInt(u.id), title: data.title, targetDate: data.target_date ? new Date(data.target_date) : null }
    });
    return NextResponse.json({ ok:true, goal_id: g.id }, { status:201 });
  } catch {
    return NextResponse.json({ ok:false, error:"Bad request" }, { status:400 });
  }
}
