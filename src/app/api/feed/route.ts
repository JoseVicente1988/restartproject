import { withMethods, okJSON } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { feedCreateSchema } from "@/lib/validation";

async function getHandler(req: Request) {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  const url = new URL(req.url);
  const limit  = Math.max(1, Math.min(50, parseInt(url.searchParams.get("limit") ?? "10", 10)));
  const offset = Math.max(0, Math.min(10000, parseInt(url.searchParams.get("offset") ?? "0", 10)));

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT p.id, p."userId", p.content, p."createdAt",
      u.name, u.email,
      (SELECT COUNT(*) FROM "FeedLike" fl WHERE fl."postId" = p.id) as "likeCount",
      (SELECT COUNT(*) FROM "FeedComment" fc WHERE fc."postId" = p.id) as "commentCount"
    FROM "FeedPost" p
    JOIN "User" u ON u.id = p."userId"
    ORDER BY p.id DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  const posts = rows.map(p => ({
    id: p.id.toString(),
    userId: p.userId?.toString?.() ?? p.userId,
    content: p.content,
    createdAt: p.createdAt,
    name: p.name,
    email: p.email,
    likeCount: Number(p.likeCount || 0),
    commentCount: Number(p.commentCount || 0)
  }));

  return okJSON({ ok:true, posts });
}

async function postHandler(req: Request) {
  const u = await currentUser(); if (!u) return okJSON({ ok:false, error:"Unauthorized" }, { status:401 });
  try {
    const data = feedCreateSchema.parse(await req.json());
    await prisma.feedPost.create({ data: { userId: BigInt(u.id), content: data.content } });
    return okJSON({ ok:true }, { status:201 });
  } catch {
    return okJSON({ ok:false, error:"Bad request" }, { status:400 });
  }
}

export const dynamic = "force-dynamic";
export const GET  = withMethods({ GET: getHandler });
export const POST = withMethods({ POST: postHandler });
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
