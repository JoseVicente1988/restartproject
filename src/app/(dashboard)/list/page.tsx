"use client";
import { useEffect, useState } from "react";

type Item = { id: string; title: string; done: boolean };

export default function ListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");

  async function load() {
    const res = await fetch("/api/list/history");
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function add() {
    if (!title.trim()) return;
    const res = await fetch("/api/list/add", { method: "POST", body: JSON.stringify({ title }) });
    if (res.ok) {
      setTitle("");
      load();
    }
  }

  async function toggle(id: string) {
    await fetch("/api/list/toggle", { method: "POST", body: JSON.stringify({ id }) });
    load();
  }

  async function remove(id: string) {
    await fetch("/api/list/remove", { method: "POST", body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div className="card">
      <h1 className="text-xl font-semibold mb-3">Lista de la compra</h1>
      <div className="row mb-3">
        <input className="input flex-1" placeholder="Ej. Leche entera" value={title} onChange={e => setTitle(e.target.value)} />
        <button className="btn" onClick={add}>Añadir</button>
      </div>
      <ul className="space-y-2">
        {items.map(i => (
          <li key={i.id} className="row">
            <input type="checkbox" checked={i.done} onChange={() => toggle(i.id)} />
            <span className={`flex-1 ${i.done ? "line-through opacity-60" : ""}`}>{i.title}</span>
            <button className="btn" onClick={() => remove(i.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
