"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

type Msg = { id: string | number; text: string; createdAt: string; mine: boolean; senderId: string | number };

export default function DMPanel({ friendId }: { friendId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    if (!friendId) return;
    try {
      const j = await api(`/api/dm?friend_id=${encodeURIComponent(friendId)}&limit=50`);
      if (j?.ok) setMsgs(j.messages || []);
    } catch {
      // silencioso para no ensuciar la UI de chat
    }
  }

  async function send() {
    const t = text.trim();
    if (!t) return;
    setText("");
    try {
      await api(`/api/dm/send`, {
        method: "POST",
        body: JSON.stringify({ friend_id: friendId, text: t }),
      });
      load(); // recarga inmediata
    } catch {}
  }

  useEffect(() => {
    load();
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(load, 2000); // 2s
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendId]);

  return (
    <div className="rounded-xl border border-[var(--border)] p-3" style={{ background: "var(--card)" }}>
      <div style={{ maxHeight: 320, overflow: "auto" }} className="space-y-2 mb-3">
        {msgs.map((m) => (
          <div
            key={String(m.id)}
            style={{ display: "flex", justifyContent: m.mine ? "flex-end" : "flex-start" }}
          >
            <div className="px-3 py-2 rounded-lg" style={{ background: "var(--chip)", border: "1px solid var(--border)" }}>
              <div>{m.text}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                {new Date(m.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {!msgs.length && <div className="text-sm" style={{ color: "var(--muted)" }}>Sin mensajes aún.</div>}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="inp flex-1"
        />
        <button onClick={send} className="btn-primary">Enviar</button>
      </div>
    </div>
  );
}
