const WINDOW_MS = 60_000;
const MAX_AUTH = 40;
const MAX_GENERIC = 300;

const mem = new Map<string, { start: number; auth: number; gen: number }>();

export function rateLimitOk(ip: string, isAuth = false) {
  const now = Date.now();
  const cur = mem.get(ip) ?? { start: now, auth: 0, gen: 0 };
  if (now - cur.start > WINDOW_MS) {
    cur.start = now; cur.auth = 0; cur.gen = 0;
  }
  if (isAuth) {
    cur.auth += 1;
    mem.set(ip, cur);
    return cur.auth <= MAX_AUTH;
  }
  cur.gen += 1;
  mem.set(ip, cur);
  return cur.gen <= MAX_GENERIC;
}
