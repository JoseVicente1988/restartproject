import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "./db";
import { getAuthCookie, setAuthCookie, clearAuthCookie } from "./cookies";

export async function createUser(email: string, password: string, name?: string | null) {
  const dup = await prisma.user.findUnique({ where: { email } });
  if (dup) throw new Error("Email already registered");
  const hash = bcrypt.hashSync(password, 10);
  await prisma.user.create({
    data: { email, passwordHash: hash, name: name ?? null }
  });
}

export async function login(email: string, password: string) {
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) throw new Error("Invalid credentials");
  const ok = bcrypt.compareSync(password, u.passwordHash);
  if (!ok) throw new Error("Invalid credentials");
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId: u.id, token, expiresAt } });
  setAuthCookie(token);
}

export async function currentUser() {
  const token = getAuthCookie();
  if (!token) return null;
  const s = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!s) return null;
  if (s.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    clearAuthCookie();
    return null;
  }
  const { id, email, name, createdAt, locale, theme, photoBase64 } = s.user;
  return { id, email, name, createdAt, locale, theme, photoBase64 };
}

export async function logout() {
  const token = getAuthCookie();
  if (token) await prisma.session.delete({ where: { token } }).catch(() => {});
  clearAuthCookie();
}
