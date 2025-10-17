"use client";
import { useState } from "react";

export default function Register() {
  const [email,setEmail]=useState(""); const [name,setName]=useState(""); const [password,setPassword]=useState(""); const [msg,setMsg]=useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setMsg("Creando…");
    const r = await fetch("/api/auth/register",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), password }) });
    const j = await r.json();
    if (!j.ok) return setMsg(j.error || "Error");
    setMsg("Cuenta creada, redirigiendo…"); setTimeout(()=>location.href="/ui", 700);
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Registro</h2>
      <form onSubmit={onSubmit} style={{ display:"grid", gap: 8, maxWidth: 360 }}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" type="email" required/>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="nombre (opcional)" type="text"/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password (min 8)" type="password" required minLength={8}/>
        <button>Crear</button>
      </form>
      <div>{msg}</div>
      <p><a href="/ui">Iniciar sesión</a></p>
    </main>
  );
}
