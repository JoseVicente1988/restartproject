// src/lib/api.ts
// Helper de fetch para el cliente (UI).
// - credentials: "include" → envía/recibe cookies (auth)
// - Si body es objeto, lo serializa a JSON y pone Content-Type
// - Soporta 204/304 (sin cuerpo) evitando "Unexpected end of JSON"
// - Si el servidor responde error con JSON, lanza Error(msg)

export type ApiInit = RequestInit & {
  body?: any; // puedes pasar string o objeto; si es objeto se JSON.stringify
};

export async function api(path: string, init: ApiInit = {}) {
  const method = (init.method || "GET").toUpperCase();

  // Clonar headers y normalizar Content-Type si body es objeto
  const headers = new Headers(init.headers || {});
  let body: BodyInit | undefined = undefined;

  if (init.body !== undefined && init.body !== null) {
    if (typeof init.body === "string" || init.body instanceof FormData) {
      body = init.body as any;
      // si es string y no hay Content-Type, asumimos JSON
      if (typeof init.body === "string" && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json; charset=utf-8");
      }
    } else {
      headers.set("Content-Type", "application/json; charset=utf-8");
      body = JSON.stringify(init.body);
    }
  } else if (method === "POST" || method === "PUT" || method === "PATCH") {
    // métodos que normalmente llevan cuerpo: aseguremos Content-Type si procede
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json; charset=utf-8");
    }
  }

  const res = await fetch(path, {
    ...init,
    method,
    headers,
    body,
    credentials: "include", // importante para la cookie "auth"
    cache: "no-store",
  });

  const status = res.status;
  const ok = res.ok;
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  const hasBody = status !== 204 && status !== 304;

  // Respuestas sin cuerpo
  if (!hasBody) {
    return { ok, status };
  }

  // Si no es JSON, devolvemos error legible
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    const msg = text || `Respuesta no JSON (HTTP ${status})`;
    const err = new Error(msg);
    (err as any).status = status;
    throw err;
  }

  // Intentar parsear JSON
  const json = await res.json().catch(() => ({}));

  // Si HTTP es error, propagar mensaje del backend si existe
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
