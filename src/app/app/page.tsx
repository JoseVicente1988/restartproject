"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

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
type DM = { id: string|number; text: string; createdAt: string; mine: boolean; senderId: string|number };
type Achievement = {
  id: string;
  code: string;
  title: string;
  desc: string;
  achieved: boolean;
  progress: number;
};

const THEMES = ["pastel","dark","ocean","forest","rose","mono","light","paper"] as const;
type ThemeName = typeof THEMES[number];

function ErrorBanner({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="card" style={{ marginTop: 12, borderColor: "var(--err)", color: "var(--err)" }}>
      {msg}
    </div>
  );
}

export default function AppPage(){
  const [tab,setTab]=useState<"items"|"feed"|"goals"|"friends"|"dms">("items");
  const [theme,setTheme]=useState<ThemeName>(() => (typeof window !== "undefined" && (localStorage.getItem("theme") as ThemeName)) || "pastel");
  const [msg,setMsg]=useState("");

  useEffect(()=>{ document.body.setAttribute("data-theme", theme); localStorage.setItem("theme", theme); },[theme]);

  /* ------------------ ITEMS ------------------ */
  const [items,setItems]=useState<Item[]>([]);
  const [title,setTitle]=useState(""); const [qty,setQty]=useState(1);

  async function loadItems(){ try{ const j = await api("/api/items"); setItems(j.items); }catch(e:any){ setMsg(e.message);} }
  async function addItem(e: any){ e.preventDefault(); try{ await api("/api/items",{ method:"POST", body: { title, qty } }); setTitle(""); setQty(1); loadItems(); } catch(e:any){ setMsg(e.message); } }
  async function toggleItem(id: string){ try{ await api(`/api/items/${id}/toggle`,{ method:"POST" }); loadItems(); }catch(e:any){ setMsg(e.message);} }
  async function delItem(id: string){ try{ await api(`/api/items/${id}`,{ method:"DELETE" }); loadItems(); }catch(e:any){ setMsg(e.message);} }

  /* ------------------ FEED (con likes) ------------------ */
  const [feed,setFeed]=useState<Post[]>([]);
  async function loadFeed(){ try{ const j = await api("/api/feed"); setFeed(j.posts); }catch(e:any){ setMsg(e.message);} }
  async function toggleLike(postId: string){
    try{
      const j = await api(`/api/feed/${postId}/like`,{ method:"POST" });
      setFeed(prev => prev.map(p => p.id===postId ? ({...p, likeCount: j.like_count}) : p));
    }catch(e:any){ setMsg(e.message); }
  }

  /* ------------------ GOALS + ACHIEVEMENTS ------------------ */
  const [goals,setGoals]=useState<Goal[]>([]);
  const [ach, setAch] = useState<Achievement[]>([]);
  async function publishGoal(id: string){ try{ await api(`/api/goals/${id}/publish`,{ method:"POST" }); loadGoals(); }catch(e:any){ setMsg(e.message);} }
  async function loadGoals(){ try{ const j = await api("/api/goals"); setGoals(j.goals); }catch(e:any){ setMsg(e.message);} }
  async function loadAchievements(){ try{ const j = await api("/api/achievements"); setAch(j.achievements||[]); }catch(e:any){} }

  /* ------------------ FRIENDS ------------------ */
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
    try{ await api("/api/friends/invite",{ method:"POST", body: { email: inviteEmail.trim().toLowerCase() } }); setInviteEmail(""); loadFriends(); }
    catch(e:any){ setMsg(e.message); }
  }
  async function acceptFriend(id: string|number){
    try{ await api("/api/friends/accept",{ method:"POST", body: { friendship_id: id } }); loadFriends(); }
    catch(e:any){ setMsg(e.message); }
  }
  async function cancelOrRemoveFriend(id: string|number){
    try{ await api("/api/friends/remove",{ method:"POST", body: { friendship_id: id } }); loadFriends(); }
    catch(e:any){ setMsg(e.message); }
  }

  const grouped = useMemo(()=>{
    const incoming: FriendRow[] = [];
    const outgoing: FriendRow[] = [];
    const accepted: FriendRow[] = [];
    for (const f of friends){
      if (f.status === "accepted") accepted.push(f);
      else if (f.status === "pending"){ incoming.push(f); outgoing.push(f); }
    }
    const dedup = (arr: FriendRow[]) => {
      const seen = new Set<string>(); const out: FriendRow[] = [];
      for (const x of arr){ const k = String(x.id); if (!seen.has(k)) { seen.add(k); out.push(x); } }
      return out;
    };
    return { incoming: dedup(incoming), outgoing: dedup(outgoing), accepted: dedup(accepted) };
  },[friends]);

  /* ------------------ DMs ------------------ */
  const [dmFriend, setDmFriend] = useState<{ id: string|number; name: string } | null>(null);
  const [dmMsgs, setDmMsgs] = useState<DM[]>([]);
  const [dmText, setDmText] = useState("");
  const [dmOffset, setDmOffset] = useState(0);
  const DM_PAGE = 20;

  async function loadDMs(reset=false){
    if (!dmFriend) return;
    try{
      const offset = reset ? 0 : dmOffset;
      const j = await api(`/api/dm?friend_id=${dmFriend.id}&limit=${DM_PAGE}&offset=${offset}`);
      const chunk: DM[] = j.messages || [];
      if (reset){ setDmMsgs(chunk.slice().reverse()); setDmOffset(chunk.length); }
      else { setDmMsgs(prev => [...chunk.slice().reverse(), ...prev]); setDmOffset(offset + chunk.length); }
    }catch(e:any){ setMsg(e.message); }
  }
  function selectDMFriend(id: string|number, name: string){
    setDmFriend({ id, name }); setDmMsgs([]); setDmOffset(0); loadDMs(true);
    setTab("dms");
  }
  async function sendDM(e:any){
    e.preventDefault();
    if (!dmFriend || !dmText.trim()) return;
    try{
      await api("/api/dm/send",{ method:"POST", body: { friend_id: dmFriend.id, text: dmText.trim() } });
      setDmText("");
      setDmOffset(0); loadDMs(true);
    }catch(e:any){ setMsg(e.message); }
  }

  /* ------------------ Lifecycle ------------------ */
  useEffect(()=>{ 
    if(tab==="items") loadItems(); 
    if(tab==="feed") loadFeed(); 
    if(tab==="friends" || tab==="dms") loadFriends(); 
    if(tab==="goals"){ loadGoals(); loadAchievements(); } 
  },[tab]);
  useEffect(()=>{ loadItems(); },[]);

  return (
    <div className="container">
      {/* Header fijo */}
      <header className="header">
        <div className="brand">
          <div className="title">GroFriends</div>
          <span className="badge">Beta</span>
        </div>
        <div className="row">
          <select className="select" value={theme} onChange={e=>setTheme(e.target.value as ThemeName)}>
            {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <a className="btn ghost" href="/ui">Salir</a>
        </div>
      </header>

      {/* Tabs fijas */}
      <nav className="tabs">
        <button className={`tab ${tab==="items"?"active":""}`} onClick={()=>setTab("items")}>Items</button>
        <button className={`tab ${tab==="feed"?"active":""}`} onClick={()=>setTab("feed")}>Feed</button>
        <button className={`tab ${tab==="goals"?"active":""}`} onClick={()=>setTab("goals")}>Metas</button>
        <button className={`tab ${tab==="friends"?"active":""}`} onClick={()=>setTab("friends")}>Amigos</button>
        <button className={`tab ${tab==="dms"?"active":""}`} onClick={()=>setTab("dms")}>DMs</button>
      </nav>

      {/* Panel fijo: el interior scrollea */}
      <section className="panel">
        <div className="panel-header">
          <div className="row">
            {tab==="items" && <h2 style={{margin:0}}>Tu lista</h2>}
            {tab==="feed"  && <h2 style={{margin:0}}>Feed</h2>}
            {tab==="goals" && <h2 style={{margin:0}}>Metas & Logros</h2>}
            {tab==="friends" && <h2 style={{margin:0}}>Amigos</h2>}
            {tab==="dms" && <h2 style={{margin:0}}>Mensajes</h2>}
          </div>

          {/* Acciones de cabecera por pestaña (no cambian la altura) */}
          <div className="row">
            {tab==="items" && (
              <>
                <form onSubmit={addItem} className="row">
                  <input className="input" style={{width:220}} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nuevo ítem" required/>
                  <input className="input" style={{width:90}} value={qty} onChange={e=>setQty(parseInt(e.target.value||"1",10))} type="number" min={1} max={9999}/>
                  <button className="btn">Añadir</button>
                </form>
              </>
            )}
            {tab==="feed" && <button className="btn secondary" onClick={loadFeed}>Recargar</button>}
            {tab==="goals" && (
              <>
                <button className="btn secondary" onClick={loadGoals}>Recargar metas</button>
                <button className="btn secondary" onClick={loadAchievements}>Recargar logros</button>
              </>
            )}
            {tab==="friends" && (
              <button className="btn secondary" onClick={loadFriends} disabled={loadingFriends}>
                {loadingFriends ? "Cargando…" : "Recargar"}
              </button>
            )}
            {tab==="dms" && <button className="btn secondary" onClick={()=> dmFriend ? loadDMs(false) : loadFriends()}>{dmFriend ? "Cargar más" : "Cargar amigos"}</button>}
          </div>
        </div>

        <div className="panel-body">
          {/* ITEMS */}
          {tab==="items" && (
            <div className="section-min">
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
                {!items.length && <li className="item"><span className="meta">Añade tu primer ítem arriba.</span></li>}
              </ul>
            </div>
          )}

          {/* FEED */}
          {tab==="feed" && (
            <div className="section-min">
              <ul className="list">
                {feed.map(p=> (
                  <li key={p.id} className="item" style={{alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <strong>{p.name||p.email}</strong> — {p.content}
                      <div className="meta">{new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="row">
                      <button className="btn" onClick={()=>toggleLike(p.id)}>♥ {p.likeCount}</button>
                      <span className="badge">💬 {p.commentCount}</span>
                    </div>
                  </li>
                ))}
                {!feed.length && <li className="item"><span className="meta">Aún no hay publicaciones.</span></li>}
              </ul>
            </div>
          )}

          {/* METAS + LOGROS */}
          {tab==="goals" && (
            <div className="section-min">
              <h3 className="muted" style={{marginTop:0}}>Tus metas</h3>
              <ul className="list">
                {goals.map(g=> (
                  <li key={g.id} className="item" style={{opacity: g.isPublic ? 1 : 0.6}}>
                    <div style={{flex:1}}>
                      <div><strong>{g.title}</strong></div>
                      <div className="meta">
                        fecha: {g.targetDate ? new Date(g.targetDate).toLocaleDateString() : "—"} · {g.isPublic ? "Pública":"Privada"}
                      </div>
                    </div>
                    {!g.isPublic && <button className="btn" onClick={()=>publishGoal(g.id)}>Publicar</button>}
                  </li>
                ))}
                {!goals.length && <li className="item"><span className="meta">Aún no tienes metas.</span></li>}
              </ul>

              <div className="hr" />

              <h3 className="muted">Logros</h3>
              <ul className="list">
                {ach.map(a => (
                  <li key={a.id} className="item" style={{alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{
                        fontWeight: 700,
                        color: a.achieved ? "var(--ink)" : "var(--muted)"
                      }}>
                        {a.title}
                      </div>
                      <div className="meta">{a.desc}</div>
                    </div>
                    <div className="row">
                      <span className="badge" style={{
                        background: a.achieved ? "var(--acc)" : "var(--chip)",
                        color: a.achieved ? "#082431" : "var(--muted)",
                        borderColor: "var(--border)"
                      }}>
                        {a.achieved ? "Conseguido" : "Pendiente"}
                      </span>
                    </div>
                  </li>
                ))}
                {!ach.length && <li className="item"><span className="meta">Sin logros definidos.</span></li>}
              </ul>
            </div>
          )}

          {/* AMIGOS */}
          {tab==="friends" && (
            <div className="section-min">
              <div className="grid cols-3">
                {/* INVITAR */}
                <div className="card" style={{padding:12}}>
                  <h3 style={{marginTop:0}} className="muted">Invitar</h3>
                  <form onSubmit={e=>{
                    e.preventDefault();
                    inviteFriend(e);
                  }} className="row">
                    <input className="input" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="Email del amigo" type="email" required/>
                    <button className="btn">Invitar</button>
                  </form>
                </div>

                {/* RECIBIDAS */}
                <div className="card" style={{padding:12}}>
                  <h3 style={{marginTop:0}} className="muted">Solicitudes recibidas</h3>
                  <ul className="list">
                    {grouped.incoming.length===0 && <li className="item"><span className="meta">No tienes solicitudes.</span></li>}
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
                    {grouped.outgoing.length===0 && <li className="item"><span className="meta">No has enviado invitaciones.</span></li>}
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
                <h3 className="muted" style={{marginTop:0}}>Tus amigos</h3>
                <ul className="list">
                  {grouped.accepted.length===0 && <li className="item"><span className="meta">Aún no tienes amigos.</span></li>}
                  {grouped.accepted.map(f => (
                    <li key={String(f.id)} className="item">
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600}}>{f.friendName || f.friendEmail}</div>
                        <div className="meta">{f.friendEmail}</div>
                      </div>
                      <div className="row">
                        <button className="btn" onClick={()=>selectDMFriend(f.friendId, (f.friendName||f.friendEmail||"Amigo"))}>Chat</button>
                        <button className="btn ghost" onClick={()=>cancelOrRemoveFriend(f.id)}>Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* DMS */}
          {tab==="dms" && (
            <div className="section-min">
              <div className="grid cols-2">
                {/* Lista de amigos aceptados */}
                <div className="card" style={{padding:12, maxHeight:380, overflow:"auto"}}>
                  <h3 className="muted" style={{marginTop:0}}>Amigos</h3>
                  <ul className="list">
                    {grouped.accepted.length===0 && <li className="item"><span className="meta">Sin amigos aún.</span></li>}
                    {grouped.accepted.map(f => (
                      <li key={String(f.friendId)} className="item">
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600}}>{f.friendName || f.friendEmail}</div>
                          <div className="meta">{f.friendEmail}</div>
                        </div>
                        <button className="btn" onClick={()=>selectDMFriend(f.friendId, (f.friendName||f.friendEmail||"Amigo"))}>Chat</button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Panel de conversación */}
                <div className="card" style={{padding:12}}>
                  <div className="row" style={{justifyContent:"space-between"}}>
                    <span className="badge">{dmFriend ? `Hablando con: ${dmFriend.name}` : "Selecciona un amigo"}</span>
                    {dmFriend && <button className="btn secondary" onClick={()=>loadDMs(false)}>Cargar más</button>}
                  </div>
                  <div className="dm-box">
                    <ul className="list">
                      {dmMsgs.map(m => (
                        <li key={String(m.id)} className="item" style={{justifyContent: m.mine ? "flex-end" : "flex-start"}}>
                          <div>
                            <div>{m.text}</div>
                            <div className="meta">{new Date(m.createdAt).toLocaleString()}</div>
                          </div>
                        </li>
                      ))}
                      {!dmMsgs.length && <li className="item"><span className="meta">No hay mensajes aún.</span></li>}
                    </ul>
                  </div>
                  <form onSubmit={sendDM} className="row" style={{marginTop:8}}>
                    <input className="input" value={dmText} onChange={e=>setDmText(e.target.value)} placeholder="Escribe un mensaje…" disabled={!dmFriend} />
                    <button className="btn" disabled={!dmFriend || !dmText.trim()}>Enviar</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          <ErrorBanner msg={msg} />
          <div style={{height:8}} />
          <footer className="muted" style={{textAlign:"center"}}>Hecho con poca prisa y mucha mala leche 💅</footer>
        </div>
      </section>
    </div>
  );
}
