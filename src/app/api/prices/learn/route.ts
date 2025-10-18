import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type LearnItem = {
  name: string;
  storeId: string | number;
  price: number;
};

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as { items: LearnItem[] };
    const items = Array.isArray(body?.items) ? body.items : [];
    if (!items.length) return NextResponse.json({ ok: false, error: "items vacíos" }, { status: 400 });

    const uid = BigInt(u.id);

    for (const it of items) {
      const name = (it.name || "").trim();
      const storeId = BigInt(it.storeId as any);
      const price = Number(it.price);
      if (!name || !storeId || !Number.isFinite(price)) continue;

      const existing = await prisma.userKnownPrice.findFirst({
        where: { userId: uid, name },
      });

      if (!existing || Number(existing.price) > price) {
        if (existing) {
          await prisma.userKnownPrice.update({
            where: { id: existing.id },
            data: { storeId, price },
          });
        } else {
          await prisma.userKnownPrice.create({
            data: { userId: uid, name, storeId, price },
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
