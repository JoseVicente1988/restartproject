// src/lib/api.ts
// Helper de fetch para UI que acepta objetos en body y añade cookies.
// Evita errores "Unexpected end of JSON" en 204/304.

export type ApiInit = RequestInit & {
  body?: any; // si es objeto lo serializamos
};

export async function api(path: string, init: ApiInit = {}) {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers || {});
  let body: BodyInit | undefined = undefined;

  if (init.body !== undefined && init.body !== null) {
    if (typeof init.body === "string" || init.body instanceof FormData) {
      body = init.body as any;
      if (typeof init.body === "string" && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json; charset=utf-8");
      }
    } else {
      headers.set("Content-Type", "application/json; charset=utf-8");
      body = JSON.stringify(init.body);
    }
  } else if (method === "POST" || method === "PUT" || method === "PATCH") {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json; charset=utf-8");
    }
  }

  const res = await fetch(path, {
    ...init,
    method,
    headers,
    body,
    credentials: "include",
    cache: "no-store",
  });

  const status = res.status;
  const ok = res.ok;
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  const hasBody = status !== 204 && status !== 304;

  if (!hasBody) return { ok, status };

  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    const msg = text || `Respuesta no JSON (HTTP ${status})`;
    const err = new Error(msg);
    (err as any).status = status;
    throw err;
  }

  const json = await res.json().catch(() => ({}));

  if (!ok) {
    const msg =
      (json && typeof json === "object" && (json.error || json.message)) ||
      `HTTP ${status}`;
    const err = new Error(msg);
    (err as any).status = status;
    (err as any).payload = json;
    throw err;
  }

  return json;
}
