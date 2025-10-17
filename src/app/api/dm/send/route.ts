import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { json } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const u = await currentUser();
    if (!u) return json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const friend_id = BigInt(body?.friend_id || 0);
    const text = String(body?.text || "").trim();
    if (!friend_id || !text) return json({ ok: false, error: "Missing friend_id or text" }, { status: 400 });

    const me = BigInt(u.id);
    const a = me < friend_id ? me : friend_id;
    const b = me < friend_id ? friend_id : me;
    const fr = await prisma.friendship.findUnique({ where: { userA_userB: { userA: a, userB: b } } });
    if (!fr || fr.status !== "accepted") return json({ ok: false, error: "Not friends" }, { status: 403 });

    const created = await prisma.dM.create({
      data: { senderId: me, receiverId: friend_id, text },
    });

    return json({ ok: true, message: { id: created.id, text: created.text, createdAt: created.createdAt } }, { status: 201 });
  } catch (err: any) {
    return json({ ok: false, error: err?.message || "Bad request" }, { status: 400 });
  }
}
