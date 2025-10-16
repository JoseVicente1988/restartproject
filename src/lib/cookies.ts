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
  } = {}
) {
  const {
    path = "/",
    httpOnly = true,
    secure = true,
    sameSite = "lax",
    maxAge,
  } = opts;
  cookies().set({
    name,
    value,
    path,
    httpOnly,
    secure,
    sameSite,
    ...(typeof maxAge === "number" ? { maxAge } : {}),
  });
}

export function deleteCookie(name: string, path = "/") {
  // En App Router, borrar = set vacío con maxAge=0
  cookies().set({ name, value: "", path, maxAge: 0 });
}
