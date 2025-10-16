"use client";
import { useEffect, useState } from "react";

type Post = { id: string; content: string; createdAt: string };

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");

  async function load() {
    const res = await fetch("/api/feed/post", { method: "GET" });
    if (res.ok) setPosts(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function submit() {
    if (!content.trim()) return;
    const res = await fetch("/api/feed/post", { method: "POST", body: JSON.stringify({ content }) });
    if (res.ok) {
      setContent("");
      load();
    }
  }

  return (
    <div className="card">
      <h1 className="text-xl font-semibold mb-3">Tablón</h1>
      <div className="row mb-3">
        <input className="input flex-1" placeholder="He completado..." value={content} onChange={e => setContent(e.target.value)} />
        <button className="btn" onClick={submit}>Publicar</button>
      </div>
      <ul className="space-y-2">
        {posts.map(p => (
          <li key={p.id} className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <div className="text-sm opacity-70">{new Date(p.createdAt).toLocaleString()}</div>
            <div>{p.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
