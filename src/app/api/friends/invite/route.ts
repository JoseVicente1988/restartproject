import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { json } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const u = await currentUser();
    if (!u) return json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    if (!email) return json({ ok: false, error: "Missing email" }, { status: 400 });

    const me = BigInt(u.id);
    const other = await prisma.user.findUnique({ where: { email } });
    if (!other) return json({ ok: false, error: "User not found" }, { status: 404 });
    if (other.id === me) return json({ ok: false, error: "Cannot invite yourself" }, { status: 400 });

    const a = me < other.id ? me : other.id;
    const b = me < other.id ? other.id : me;
    const existing = await prisma.friendship.findUnique({ where: { userA_userB: { userA: a, userB: b } } });
    if (existing) return json({ ok: false, error: "Already invited or friends" }, { status: 409 });

    await prisma.friendship.create({
      data: { userA: a, userB: b, status: "pending", requestedBy: me },
    });

    return json({ ok: true }, { status: 201 });
  } catch (err: any) {
    return json({ ok: false, error: err?.message || "Bad request" }, { status: 400 });
  }
}
