"use client";
import { useEffect, useState } from "react";

type Friend = { id: string; email: string; name: string };
type Message = { id: string; fromId: string; toId: string; text: string; createdAt: string };

export default function FriendsPage() {
  const [email, setEmail] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [active, setActive] = useState<Friend | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [text, setText] = useState("");

  async function loadFriends() {
    const res = await fetch("/api/friends/add", { method: "GET" });
    if (res.ok) setFriends(await res.json());
  }

  async function addFriend() {
    if (!email.trim()) return;
    const res = await fetch("/api/friends/add", { method: "POST", body: JSON.stringify({ email }) });
    if (res.ok) {
      setEmail("");
      loadFriends();
    }
  }

  async function removeFriend(id: string) {
    await fetch("/api/friends/remove", { method: "POST", body: JSON.stringify({ id }) });
    loadFriends();
    if (active?.id === id) setActive(null);
  }

  async function loadHistory() {
    if (!active) return;
    const res = await fetch(`/api/chat/history?peer=${encodeURIComponent(active.id)}`);
    if (res.ok) setHistory(await res.json());
  }

  async function send() {
    if (!active || !text.trim()) return;
    const res = await fetch("/api/chat/send", { method: "POST", body: JSON.stringify({ toId: active.id, text }) });
    if (res.ok) {
      setText("");
      loadHistory();
    }
  }

  useEffect(() => { loadFriends(); }, []);
  useEffect(() => {
    loadHistory();
    const id = setInterval(loadHistory, 3000);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="card md:col-span-1">
        <h2 className="font-semibold mb-2">Amigos</h2>
        <div className="row mb-3">
          <input className="input flex-1" placeholder="email@amigo.com" value={email} onChange={e => setEmail(e.target.value)} />
          <button className="btn" onClick={addFriend}>Añadir</button>
        </div>
        <ul className="space-y-2">
          {friends.map(f => (
            <li key={f.id} className="row">
              <button className="btn flex-1 text-left" onClick={() => setActive(f)}>{f.name} <span className="opacity-70 ml-2">{f.email}</span></button>
              <button className="btn" onClick={() => removeFriend(f.id)}>✕</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card md:col-span-2">
        <h2 className="font-semibold mb-2">{active ? `Chat con ${active.name}` : "Chat"}</h2>
        <div className="h-80 overflow-auto border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 mb-3">
          {history.map(m => (
            <div key={m.id} className="mb-1">
              <div className="text-xs opacity-70">{new Date(m.createdAt).toLocaleString()}</div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="row">
          <input className="input flex-1" placeholder="Escribe un mensaje..." value={text} onChange={e => setText(e.target.value)} />
          <button className="btn" onClick={send}>Enviar</button>
        </div>
      </div>
    </div>
  );
}
