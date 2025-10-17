import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { commentSchema } from "@/lib/validation";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const pid = BigInt(params.id);
  try {
    const data = commentSchema.parse(await req.json());
    await prisma.feedComment.create({ data: { postId: pid, userId: BigInt(u.id), text: data.text } });
    return NextResponse.json({ ok:true }, { status:201 });
  } catch {
    return NextResponse.json({ ok:false, error:"Bad request" }, { status:400 });
  }
}
