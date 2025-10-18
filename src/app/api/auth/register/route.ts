import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { withMethods, okJSON } from "@/lib/http";

async function postHandler(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const email = (body.email || "").toString().trim().toLowerCase();
  const name = (body.name || "").toString().trim();
  const password = (body.password || "").toString();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return okJSON({ ok:false, error:"Invalid email" }, { status:400 });
  if (password.length < 8 || password.length > 72) return okJSON({ ok:false, error:"Invalid password length" }, { status:400 });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return okJSON({ ok:false, error:"Email already registered" }, { status:409 });

  const passwordHash = bcrypt.hashSync(password, 10);
  await prisma.user.create({ data: { email, passwordHash, name: name || null } });
  return okJSON({ ok:true }, { status:201 });
}

export const dynamic = "force-dynamic";
export const POST = withMethods({ POST: postHandler });
export const OPTIONS = withMethods({ OPTIONS: async () => okJSON({}, { status:204 }) });
