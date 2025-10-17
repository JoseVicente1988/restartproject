import { cookies } from "next/headers";

export const AUTH_COOKIE = "sid";

export function setAuthCookie(token: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  cookies().set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds
  });
}

export function clearAuthCookie() {
  cookies().set({ name: AUTH_COOKIE, value: "", path: "/", maxAge: 0 });
}

export function getAuthCookie(): string | null {
  return cookies().get(AUTH_COOKIE)?.value ?? null;
}
