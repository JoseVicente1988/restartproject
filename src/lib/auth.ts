import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change";

export type SessionUser = { id: string; email: string; name: string };

export async function registerUser(email: string, name: string, password: string) {
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, password: hash } });
  return user;
}

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return user;
}

export function signToken(user: SessionUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function getUserFromCookie(): SessionUser | null {
  const token = cookies().get("auth")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}
