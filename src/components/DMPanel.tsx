"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string | number;
  text: string;
  createdAt: string;
  mine: boolean;
  senderId: string | number;
};

export default function DMPanel({ friendId }: { friendId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");

  // 👇 clave: que el tipo se adapte tanto a DOM (number) como a Node (Timeout)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    if (!friendId) return;
    try {
      const r = await fetch(`/api/dm?friend_id=${encodeURIComponent(friendId)}&limit=50`);
      const j = await r.json();
      if (j?.ok) setMsgs(j.messages);
    } catch {
      // silencioso
    }
  }

  async function send() {
    const t = text.trim();
    if (!t) return;
    setText("");
    try {
      await fetch(`/api/dm/send`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ friend_id: friendId, text: t }),
      });
      // recarga inmediata para no esperar al polling
      load();
    } catch {
      // silencioso
    }
  }

  useEffect(() => {
    load();
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(load, 2000); // 2s
    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendId]);

  return (
    <div className="rounded-xl border border-[var(--border)] p-3 bg-[var(--card)]">
      <div style={{ maxHeight: 320, overflow: "auto" }} className="space-y-2 mb-3">
        {msgs.map((m) => (
          <div
            key={String(m.id)}
            style={{ display: "flex", justifyContent: m.mine ? "flex-end" : "flex-start" }}
          >
            <div
              className="px-3 py-2 rounded-lg"
              style={{ background: "var(--chip)", border: "1px solid var(--border)" }}
            >
              <div>{m.text}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                {new Date(m.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {!msgs.length && (
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            Sin mensajes aún.
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="inp flex-1"
        />
        <button onClick={send} className="btn-primary">
          Enviar
        </button>
      </div>
    </div>
  );
}
