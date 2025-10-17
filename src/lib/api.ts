export async function api(path: string, init: RequestInit = {}) {
  const hasBody = init.body !== undefined;
  const headers = new Headers(init.headers || {});
  if (hasBody && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  let r: Response;
  try {
    r = await fetch(path, { ...init, headers, credentials: "include", redirect: "follow" });
  } catch (err: any) {
    throw new Error(`Conexión fallida: ${err?.message || err}`);
  }

  if (r.status === 401) {
    if (typeof window !== "undefined") window.location.href = "/ui";
    throw new Error("No autorizado");
  }

  if (r.status === 204) return { ok: true };

  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = await r.json().catch(() => null);
    if (!j) throw new Error(`HTTP ${r.status}: Respuesta JSON inválida`);
    if (!j.ok) {
      const msg = (j as any).error || (j as any).message || `HTTP ${r.status}`;
      throw new Error(msg);
    }
    return j;
  }

  const text = await r.text().catch(() => "");
  if (!r.ok) {
    if (text?.startsWith("<")) throw new Error(`HTTP ${r.status} (HTML).`);
    throw new Error(text || `HTTP ${r.status}`);
  }
  return { ok: true, data: text };
}
