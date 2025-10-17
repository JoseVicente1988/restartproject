import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { feedCreateSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(50, parseInt(url.searchParams.get("limit") ?? "10", 10)));
  const offset = Math.max(0, Math.min(10000, parseInt(url.searchParams.get("offset") ?? "0", 10)));

  const posts = await prisma.$queryRawUnsafe<any[]>(`
    SELECT p.id, p.user_id as "userId", p.content, p.created_at as "createdAt",
      u.name, u.email,
      (SELECT COUNT(*) FROM "FeedLike" fl WHERE fl.post_id = p.id) as "likeCount",
      (SELECT COUNT(*) FROM "FeedComment" fc WHERE fc.post_id = p.id) as "commentCount"
    FROM "FeedPost" p
    JOIN "User" u ON u.id = p.user_id
    ORDER BY p.id DESC
    LIMIT ${limit} OFFSET ${offset}
  `);
  return NextResponse.json({ ok:true, posts });
}

export async function POST(req: Request) {
  const u = await currentUser(); if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  try {
    const data = feedCreateSchema.parse(await req.json());
    await prisma.feedPost.create({ data: { userId: BigInt(u.id), content: data.content } });
    return NextResponse.json({ ok:true }, { status:201 });
  } catch {
    return NextResponse.json({ ok:false, error:"Bad request" }, { status:400 });
  }
}
