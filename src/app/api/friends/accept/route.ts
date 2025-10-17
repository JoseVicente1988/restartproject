import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { json } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const u = await currentUser();
    if (!u) return json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const friendship_id = BigInt(body?.friendship_id || 0n);
    if (!friendship_id) return json({ ok: false, error: "Invalid id" }, { status: 400 });

    const row = await prisma.friendship.findUnique({ where: { id: friendship_id } });
    if (!row) return json({ ok: false, error: "Not found" }, { status: 404 });

    const me = BigInt(u.id);
    if (row.userA !== me && row.userB !== me) return json({ ok: false, error: "Forbidden" }, { status: 403 });

    await prisma.friendship.update({ where: { id: friendship_id }, data: { status: "accepted" } });
    return json({ ok: true });
  } catch (err: any) {
    return json({ ok: false, error: err?.message || "Bad request" }, { status: 400 });
  }
}
