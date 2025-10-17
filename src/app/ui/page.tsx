"use client";
import { useState } from "react";

export default function Login() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [msg,setMsg]=useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setMsg("Autenticando…");
    const r = await fetch("/api/auth/login",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email: email.trim().toLowerCase(), password }) });
    const j = await r.json();
    if (!j.ok) return setMsg(j.error || "Error");
    location.href = "/app";
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Accede</h2>
      <form onSubmit={onSubmit} style={{ display:"grid", gap: 8, maxWidth: 360 }}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" type="email" required/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" required minLength={8}/>
        <button>Entrar</button>
      </form>
      <div>{msg}</div>
      <p><a href="/ui/register">Crear cuenta</a></p>
    </main>
  );
}
