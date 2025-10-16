import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = getUserFromCookie();
  if (!user) return NextResponse.json([], { status: 200 });
  const posts = await prisma.feedPost.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const user = getUserFromCookie();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { content } = await req.json();
  const post = await prisma.feedPost.create({ data: { userId: user.id, content } });
  return NextResponse.json(post);
}
