// Helper de fetch con:
// - Content-Type para JSON en POST/PUT/PATCH
// - credentials: "include" (cookies de sesión)
// - tolerante con 204/no JSON para evitar "Unexpected end of JSON"

type ApiOptions = RequestInit & {
  // si pasas body como objeto, lo serializa solo
  body?: string | object | null;
};

export async function api(path: string, opts: ApiOptions = {}) {
  const headers = new Headers(opts.headers || {});
  const method = (opts.method || "GET").toUpperCase();

  // Serializa body si viene como objeto
  let body: BodyInit | undefined = undefined;
  if (opts.body !== undefined && opts.body !== null) {
    if (typeof opts.body === "string") {
      body = opts.body;
    } else {
      headers.set("Content-Type", "application/json; charset=utf-8");
      body = JSON.stringify(opts.body);
    }
  } else if (method === "POST" || method === "PUT" || method === "PATCH") {
    // si no hay body pero es método con payload, fuerza header para coherencia
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json; charset=utf-8");
  }

  const res = await fetch(path, {
    ...opts,
    method,
    headers,
    body,
    credentials: "include", // importante para Set-Cookie/uso de cookie auth
  });

  // 204 o sin contenido: devuelve objeto mínimo
  const ct = res.headers.get("content-type") || "";
  const hasBody = res.status !== 204 && res.status !== 304;

  if (!hasBody) {
    // normaliza respuesta para tu UI
    return { ok: res.ok, status: res.status };
  }

  // Si no es JSON, genera error legible en vez de "Unexpected end of JSON"
  if (!ct.toLowerCase().includes("application/json")) {
    const text = await res.text().catch(() => "");
    const err = new Error(text || `Respuesta no JSON (HTTP ${res.status})`);
    (err as any).status = res.status;
    throw err;
  }

  const json = await res.json().catch(() => ({}));
  // si el servidor devolvió error HTTP pero con JSON, propágalo
  if (!res.ok && json && typeof json === "object") {
    const e = new Error(json.error || `HTTP ${res.status}`);
    (e as any).status = res.status;
    throw e;
  }
  return json;
}
