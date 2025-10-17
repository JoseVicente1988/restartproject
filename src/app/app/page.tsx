"use client";
import { useEffect, useState } from "react";

type Item = { id: string; title: string; qty: number; note?: string|null; done: boolean; createdAt: string };
type Post = { id: string; content: string; createdAt: string; name?: string|null; email: string; likeCount: number; commentCount: number };
type Goal = { id: string; title: string; targetDate?: string|null; isPublic: boolean };

export default function AppPage(){
  const [tab,setTab]=useState<"items"|"feed"|"goals"|"friends">("items");
  const [items,setItems]=useState<Item[]>([]);
  const [title,setTitle]=useState(""); const [qty,setQty]=useState(1);
  const [feed,setFeed]=useState<Post[]>([]);
  const [goals,setGoals]=useState<Goal[]>([]);
  const [msg,setMsg]=useState("");

  async function api(path:string, init?:RequestInit){ const r=await fetch(path, { ...init, headers: { "Content-Type":"application/json" } }); return r.json(); }

  useEffect(()=>{ loadItems(); },[]);

  async function loadItems(){ const j = await api("/api/items"); if(j.ok) setItems(j.items); else setMsg(j.error); }
  async function addItem(e: any){ e.preventDefault(); const j = await api("/api/items",{ method:"POST", body: JSON.stringify({ title, qty })}); if(j.ok){ setTitle(""); setQty(1); loadItems(); } }
  async function toggleItem(id: string){ const j = await api(`/api/items/${id}/toggle`,{ method:"POST" }); if(j.ok) loadItems(); }
  async function delItem(id: string){ const j = await api(`/api/items/${id}`,{ method:"DELETE" }); if(j.ok) loadItems(); }

  async function loadFeed(){ const j = await api("/api/feed"); if(j.ok) setFeed(j.posts); }
  async function publishGoal(id: string){ const j = await api(`/api/goals/${id}/publish`,{ method:"POST" }); if(j.ok) loadGoals(); }
  async function loadGoals(){ const j = await api("/api/goals"); if(j.ok) setGoals(j.goals); }

  useEffect(()=>{ if(tab==="feed") loadFeed(); if(tab==="goals") loadGoals(); if(tab==="items") loadItems(); },[tab]);

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        <button onClick={()=>setTab("items")}>Items</button>
        <button onClick={()=>setTab("feed")}>Feed</button>
        <button onClick={()=>setTab("goals")}>Metas</button>
        <button onClick={()=>setTab("friends")}>Amigos</button>
      </div>

      {tab==="items" && (
        <section>
          <form onSubmit={addItem} style={{ display:"flex", gap:8, marginBottom:12 }}>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nuevo ítem" required/>
            <input value={qty} onChange={e=>setQty(parseInt(e.target.value||"1",10))} type="number" min={1} max={9999} style={{ width:100 }}/>
            <button>Añadir</button>
          </form>
          <ul style={{ listStyle:"none", padding:0 }}>
            {items.map(it=> (
              <li key={it.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #eee" }}>
                <span style={{ textDecoration: it.done ? "line-through":"none" }}>{it.title} × {it.qty}</span>
                <span style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>toggleItem(it.id)}>{it.done ? "Desmarcar":"Hecho"}</button>
                  <button onClick={()=>delItem(it.id)}>Borrar</button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab==="feed" && (
        <section>
          <ul style={{ listStyle:"none", padding:0 }}>
            {feed.map(p=> (
              <li key={p.id} style={{ border:"1px solid #eee", borderRadius:8, padding:12, margin:"8px 0" }}>
                <strong>{p.name||p.email}</strong> — {p.content}
                <div style={{ color:"#555" }}>{new Date(p.createdAt).toLocaleString()}</div>
                <div style={{ color:"#555" }}>♥ {p.likeCount} · 💬 {p.commentCount}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab==="goals" && (
        <section>
          <button onClick={()=>loadGoals()}>Recargar</button>
          <ul style={{ listStyle:"none", padding:0 }}>
            {goals.map(g=> (
              <li key={g.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #eee" }}>
                <span><strong>{g.title}</strong> · {g.targetDate ? new Date(g.targetDate).toLocaleDateString() : "—"} · {g.isPublic ? "Pública":"Privada"}</span>
                {!g.isPublic && <button onClick={()=>publishGoal(g.id)}>Publicar</button>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab==="friends" && (
        <section>
          <p>Endpoints de amigos listos en /api/friends (invitar/aceptar/eliminar). UI básica pendiente.</p>
        </section>
      )}

      <div style={{ color:"crimson" }}>{msg}</div>
    </main>
  );
}
