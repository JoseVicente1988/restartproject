"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Item = { id: string; title: string; qty: number; note?: string|null; done: boolean; createdAt: string };
type Post = { id: string; content: string; createdAt: string; name?: string|null; email: string; likeCount: number; commentCount: number };
type Goal = { id: string; title: string; targetDate?: string|null; isPublic: boolean };

type FriendRow = {
  id: string | number;
  status: "pending" | "accepted" | string;
  requestedBy: string | number;
  friendId: string | number;
  friendName?: string | null;
  friendEmail?: string | null;
};

const THEMES = ["pastel","dark","ocean","forest","rose","mono"] as const;
type ThemeName = typeof THEMES[number];

export default function AppPage(){
  const [tab,setTab]=useState<"items"|"feed"|"goals"|"friends">("items");
  const [theme,setTheme]=useState<ThemeName>(() => (typeof window !== "undefined" && (localStorage.getItem("theme") as ThemeName)) || "pastel");

  // ---------------------- Helpers ----------------------
  async function api(path:string, init?:RequestInit){
    const r=await fetch(path, { ...init, headers: { "Content-Type":"application/json" } });
    const ct = r.headers.get("content-type")||"";
    if (!ct.includes("application/json")) throw new Error("Respuesta no JSON");
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "Error");
    return j;
  }
  useEffect(()=>{ document.body.setAttribute("data-theme", theme); localStorage.setItem("theme", theme); },[theme]);

  // ---------------------- Items ----------------------
  const [items,setItems]=useState<Item[]>([]);
  const [title,setTitle]=useState(""); const [qty,setQty]=useState(1);
  const [msg,setMsg]=useState("");

  async function loadItems(){ try{ const j = await api("/api/items"); setItems(j.items); }catch(e:any){ setMsg(e.message);} }
  async function addItem(e: any){ e.preventDefault(); try{ await api("/api/items",{ method:"POST", body: JSON.stringify({ title, qty })}); setTitle(""); setQty(1); loadItems(); } catch(e:any){ setMsg(e.message); } }
  async function toggleItem(id: string){ try{ await api(`/api/items/${id}/toggle`,{ method:"POST" }); loadItems(); }catch(e:any){ setMsg(e.message);} }
  async function delItem(id: string){ try{ await api(`/api/items/${id}`,{ method:"DELETE" }); loadItems(); }catch(e:any){ setMsg(e.message);} }

  // ---------------------- Feed & Goals ----------------------
  const [feed,setFeed]=useState<Post[]>([]);
  const [goals,setGoals]=useState<Goal[]>([]);
  async function loadFeed(){ try{ const j = await api("/api/feed"); setFeed(j.posts); }catch(e:any){ setMsg(e.message);} }
  async function publishGoal(id: string){ try{ await api(`/api/goals/${id}/publish`,{ method:"POST" }); loadGoals(); }catch(e:any){ setMsg(e.message);} }
  async function loadGoals(){ try{ const j = await api("/api/goals"); setGoals(j.goals); }catch(e:any){ setMsg(e.message);} }

  // ---------------------- Friends (UI completa) ----------------------
  const [inviteEmail,setInviteEmail]=useState("");
  const [friends,setFriends]=useState<FriendRow[]>([]);
  const [loadingFriends,setLoadingFriends]=useState(false);

  async function loadFriends(){
    try{
      setLoadingFriends(true);
      const j = await api("/api/friends");
      setFriends(j.friends || []);
    } catch(e:any){
      setMsg(e.message);
    } finally { setLoadingFriends(false); }
  }
  async function inviteFriend(e:any){
    e.preventDefault(); if(!inviteEmail.trim()) return;
    try{ await api("/api/friends/invite",{ method:"POST", body: JSON.stringify({ email: inviteEmail.trim().toLowerCase() })}); setInviteEmail(""); loadFriends(); }
    catch(e:any){ setMsg(e.message); }
  }
  async function acceptFriend(id: string|number){
    try{ await api("/api/friends/accept",{ method:"POST", body: JSON.stringify({ friendship_id: id })}); loadFriends(); }
    catch(e:any){ setMsg(e.message); }
  }
  async function cancelOrRemoveFriend(id: string|number){
    try{ await api("/api/friends/remove",{ method:"POST", body: JSON.stringify({ friendship_id: id })}); loadFriends(); }
    catch(e:any){ setMsg(e.message); }
  }

  const grouped = useMemo(()=>{
    const incoming: FriendRow[] = [];
    const outgoing: FriendRow[] = [];
    const accepted: FriendRow[] = [];
    for (const f of friends){
      if (f.status === "accepted") accepted.push(f);
      else if (f.status === "pending"){
        // necesitamos saber si la solicitud la envié yo o me la enviaron
        outgoing.push(f); // por defecto
      } else {
        // otro estado, ignor
      }
    }
    // Si el backend no trae "requestedBy" como número comparable con mi userId,
    // mostramos los pending en ambas listas según acción.
    // Para UX útil: los pending aparecen en "Recibidas" y "Enviadas" con botones distintos.
    // Si tu API ya expone requestedBy y meId, puedes separar aquí con precisión.

    // Heurística: pending => si aparece botón "Aceptar" lo pondremos en Incoming,
    // pero como necesitamos meId para saberlo, duplicamos en ambos paneles y cada acción validará en backend.
    const dedup = (arr: FriendRow[]) => {
      const seen = new Set<string>(); const out: FriendRow[] = [];
      for (const x of arr){ const k = String(x.id); if (!seen.has(k)) { seen.add(k); out.push(x); } }
      return out;
    };
    return {
      incoming: dedup(friends.filter(f => f.status==="pending")),   // mostrará Aceptar/Rechazar
      outgoing: dedup(friends.filter(f => f.status==="pending")),   // mostrará Cancelar
      accepted: dedup(accepted)
    };
  },[friends]);

  // ---------------------- Boot ----------------------
  useEffect(()=>{ if(tab==="items") loadItems(); if(tab==="feed") loadFeed(); if(tab==="goals") loadGoals(); if(tab==="friends") loadFriends(); },[tab]);
  useEffect(()=>{ loadItems(); },[]);

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <div className="title">GroFriends</div>
          <span className="badge">Beta</span>
        </div>
        <div className="toolbar">
          <select className="select" value={theme} onChange={e=>setTheme(e.target.value as ThemeName)}>
            {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <a className="btn ghost" href="/ui">Salir</a>
        </div>
      </header>

      <nav className="tabs">
        <button className={`tab ${tab==="items"?"active":""}`} onClick={()=>setTab("items")}>Items</button>
        <button className={`tab ${tab==="feed"?"active":""}`} onClick={()=>setTab("feed")}>Feed</button>
        <button className={`tab ${tab==="goals"?"active":""}`} onClick={()=>setTab("goals")}>Metas</button>
        <button className={`tab ${tab==="friends"?"active":""}`} onClick={()=>setTab("friends")}>Amigos</button>
      </nav>

      {/* ITEMS */}
      {tab==="items" && (
        <section className="card">
          <h2 style={{marginTop:0}}>Tu lista</h2>
          <form onSubmit={addItem} className="row" style={{marginBottom:12}}>
            <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nuevo ítem" required/>
            <input className="input" value={qty} onChange={e=>setQty(parseInt(e.target.value||"1",10))} type="number" min={1} max={9999}/>
            <button className="btn">Añadir</button>
          </form>
          <ul className="list">
            {items.map(it=> (
              <li key={it.id} className="item">
                <div style={{flex:1}}>
                  <div style={{textDecoration: it.done ? "line-through":"none", fontWeight:600}}>{it.title} × {it.qty}</div>
                  <div className="meta">{new Date(it.createdAt).toLocaleString()}</div>
                </div>
                <div className="row">
                  <button className="btn" onClick={()=>toggleItem(it.id)}>{it.done ? "Desmarcar":"Hecho"}</button>
                  <button className="btn secondary" onClick={()=>delItem(it.id)}>Borrar</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FEED */}
      {tab==="feed" && (
        <section className="card">
          <h2 style={{marginTop:0}}>Feed</h2>
          <ul className="list">
            {feed.map(p=> (
              <li key={p.id} className="item" style={{alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <strong>{p.name||p.email}</strong> — {p.content}
                  <div className="meta">{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div className="muted">♥ {p.likeCount} · 💬 {p.commentCount}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* GOALS */}
      {tab==="goals" && (
        <section className="card">
          <div className="row" style={{justifyContent:"space-between"}}>
            <h2 style={{marginTop:0}}>Metas</h2>
            <button className="btn secondary" onClick={()=>loadGoals()}>Recargar</button>
          </div>
          <ul className="list">
            {goals.map(g=> (
              <li key={g.id} className="item">
                <div style={{flex:1}}>
                  <div><strong>{g.title}</strong></div>
                  <div className="meta">
                    fecha: {g.targetDate ? new Date(g.targetDate).toLocaleDateString() : "—"} · {g.isPublic ? "Pública":"Privada"}
                  </div>
                </div>
                {!g.isPublic && <button className="btn" onClick={()=>publishGoal(g.id)}>Publicar</button>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FRIENDS */}
      {tab==="friends" && (
        <section className="card">
          <div className="row" style={{justifyContent:"space-between"}}>
            <h2 style={{marginTop:0}}>Amigos</h2>
            <button className="btn secondary" onClick={()=>loadFriends()} disabled={loadingFriends}>
              {loadingFriends ? "Cargando…" : "Recargar"}
            </button>
          </div>

          <div className="grid cols-3">
            {/* INVITAR */}
            <div className="card" style={{padding:12}}>
              <h3 style={{marginTop:0}} className="muted">Invitar</h3>
              <form onSubmit={inviteFriend} className="row">
                <input className="input" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="Email del amigo" type="email" required/>
                <button className="btn">Invitar</button>
              </form>
            </div>

            {/* SOLICITUDES RECIBIDAS */}
            <div className="card" style={{padding:12}}>
              <h3 style={{marginTop:0}} className="muted">Solicitudes recibidas</h3>
              <ul className="list">
                {grouped.incoming.length===0 && <li className="item"><span className="muted">No tienes solicitudes.</span></li>}
                {grouped.incoming.map(f => (
                  <li key={String(f.id)} className="item">
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600}}>{f.friendName || f.friendEmail}</div>
                      <div className="meta">{f.friendEmail}</div>
                    </div>
                    <div className="row">
                      <button className="btn" onClick={()=>acceptFriend(f.id)}>Aceptar</button>
                      <button className="btn secondary" onClick={()=>cancelOrRemoveFriend(f.id)}>Rechazar</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* ENVIADAS */}
            <div className="card" style={{padding:12}}>
              <h3 style={{marginTop:0}} className="muted">Enviadas</h3>
              <ul className="list">
                {grouped.outgoing.length===0 && <li className="item"><span className="muted">No has enviado invitaciones.</span></li>}
                {grouped.outgoing.map(f => (
                  <li key={String(f.id)} className="item">
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600}}>{f.friendName || f.friendEmail}</div>
                      <div className="meta">{f.friendEmail}</div>
                    </div>
                    <button className="btn secondary" onClick={()=>cancelOrRemoveFriend(f.id)}>Cancelar</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="hr"></div>

          {/* ACEPTADOS */}
          <div className="card" style={{padding:12}}>
            <h3 style={{marginTop:0}} className="muted">Tus amigos</h3>
            <ul className="list">
              {grouped.accepted.length===0 && <li className="item"><span className="muted">Aún no tienes amigos.</span></li>}
              {grouped.accepted.map(f => (
                <li key={String(f.id)} className="item">
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600}}>{f.friendName || f.friendEmail}</div>
                    <div className="meta">{f.friendEmail}</div>
                  </div>
                  <div className="row">
                    {/* Aquí podrías enlazar a DMs cuando tengas UI */}
                    {/* <button className="btn">Chat</button> */}
                    <button className="btn ghost" onClick={()=>cancelOrRemoveFriend(f.id)}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {msg && <div className="card" style={{marginTop:12, color:"var(--err)"}}>{msg}</div>}
      <div style={{height:20}} />
      <footer className="muted" style={{textAlign:"center"}}>Hecho con poca prisa y mucha mala leche 💅</footer>
    </div>
  );
}
