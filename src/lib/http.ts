import { NextResponse } from "next/server";

const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || ""; // opcional: fija tu dominio si quieres

export function corsHeaders() {
  const h = new Headers();
  h.set("Vary", "Origin");
  h.set("Access-Control-Allow-Credentials", "true");
  h.set("Access-Control-Allow-Headers", "content-type, authorization");
  h.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (ORIGIN) h.set("Access-Control-Allow-Origin", ORIGIN);
  return h;
}

export function okJSON(data: any, init: ResponseInit = {}) {
  const hdrs = new Headers(init.headers || {});
  corsHeaders().forEach((v, k) => hdrs.set(k, v));
  hdrs.set("Content-Type", "application/json; charset=utf-8");
  return new NextResponse(JSON.stringify(data), { ...init, headers: hdrs });
}

export function noContent() {
  const hdrs = corsHeaders();
  return new NextResponse(null, { status: 204, headers: hdrs });
}

export function methodNotAllowed(allow: string[]) {
  const hdrs = corsHeaders();
  hdrs.set("Allow", allow.join(", "));
  return okJSON({ ok: false, error: "Method Not Allowed", allow }, { status: 405, headers: hdrs });
}

type HandlerMap = Partial<Record<
  "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS",
  (req: Request) => Promise<Response> | Response
>>;

/** Despacha por método y responde OPTIONS 204 por defecto (evita 405 de preflight) */
export function withMethods(map: HandlerMap) {
  const allow = Object.keys(map) as string[];
  const impl = async (req: Request) => {
    const m = req.method.toUpperCase() as keyof HandlerMap;
    if (m === "OPTIONS") return noContent();
    const fn = map[m];
    return fn ? fn(req) : methodNotAllowed(allow.length ? allow : ["GET","POST","OPTIONS"]);
  };
  return impl;
}
