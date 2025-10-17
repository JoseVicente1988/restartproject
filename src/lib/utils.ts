// Convierte BigInt a string para que JSON no falle, y responde como application/json
export function json(data: any, init?: ResponseInit) {
  return new Response(
    JSON.stringify(
      data,
      (_, v) => (typeof v === "bigint" ? v.toString() : v)
    ),
    {
      ...init,
      headers: {
        "content-type": "application/json; charset=utf-8",
        ...(init?.headers || {}),
      },
    }
  );
}
