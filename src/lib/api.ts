// Fetch robusto: maneja 204, cuerpos vacíos y respuestas no-JSON.
// Lanza Error con mensaje útil cuando status !ok.
export async function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  // Solo ponemos Content-Type si hay body
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (!headers.has("accept")) headers.set("accept", "application/json");

  const res = await fetch(path, { ...init, headers, credentials: "include" });

  // 204 No Content => objeto vacío
  if (res.status === 204) return {};

  const ct = res.headers.get("content-type") || "";
  const text = await res.text();

  let data: any = null;
  if (ct.includes("application/json") && text) {
    try { data = JSON.parse(text); } catch { /* se ignora */ }
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message))
      || (text && text.slice(0, 400))
      || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // A veces devuelven 200 sin cuerpo JSON
  return data ?? {};
}
