// Utilidades de cookies para App Router (Next 13/14/15)
import { cookies } from "next/headers";

export function getCookie(name: string): string | null {
  const val = cookies().get(name)?.value;
  return typeof val === "string" ? val : null;
}

export function setCookie(
  name: string,
  value: string,
  opts: {
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
    maxAge?: number; // segundos
    domain?: string;
  } = {}
) {
  const {
    path = "/",
    httpOnly = true,
    secure = true,
    sameSite = "lax",
    maxAge,
    domain,
  } = opts;

  cookies().set({
    name,
    value,
    path,
    httpOnly,
    secure,
    sameSite,
    ...(typeof maxAge === "number" ? { maxAge } : {}),
    ...(domain ? { domain } : {}),
  });
}

export function deleteCookie(name: string, path = "/", domain?: string) {
  // En App Router, borrar = set vacío con maxAge=0
  cookies().set({
    name,
    value: "",
    path,
    maxAge: 0,
    ...(domain ? { domain } : {}),
  });
}

/** Helpers de autenticación (ajusta el nombre si usas otro) */
export const AUTH_COOKIE = "token";

export function setAuthCookie(token: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  setCookie(AUTH_COOKIE, token, { maxAge: maxAgeSeconds, httpOnly: true, secure: true, sameSite: "lax", path: "/" });
}

export function clearAuthCookie() {
  deleteCookie(AUTH_COOKIE, "/");
}
