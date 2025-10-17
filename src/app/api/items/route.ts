import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { itemCreateSchema } from "@/lib/validation";
import { json } from "@/lib/utils";

export async function GET() {
  try {
    const u = await currentUser();
    if (!u) return json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const items = await prisma.item.findMany({
      where: { userId: BigInt(u.id) },
      orderBy: [{ done: "asc" }, { id: "desc" }],
    });

    return json({ ok: true, items });
  } catch (err: any) {
    return json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const u = await currentUser();
    if (!u) return json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const data = itemCreateSchema.parse(await req.json());

    await prisma.item.create({
      data: { userId: BigInt(u.id), title: data.title, qty: data.qty, note: data.note ?? null },
    });

    const remaining = await prisma.item.count({ where: { userId: BigInt(u.id), done: false } });
    if (remaining === 0) {
      await prisma.feedPost.create({ data: { userId: BigInt(u.id), content: "¡Lista completada hoy! 🏁" } });
    }

    return json({ ok: true }, { status: 201 });
  } catch (err: any) {
    return json({ ok: false, error: err?.message || "Bad request" }, { status: 400 });
  }
}
