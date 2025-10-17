"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/src/lib/api";

export default function RegisterPage(){
  const [email,setEmail] = useState("");
  const [name,setName] = useState("");
  const [password,setPassword] = useState("");
  const [msg,setMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("Creando usuario…");
    try{
      const j = await api("/api/auth/register",{ method:"POST", body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), password })});
      if (j.ok) {
        setMsg("Cuenta creada. Redirigiendo…");
        setTimeout(()=> window.location.href="/ui", 700);
      }
    }catch(err:any){
      setMsg(err.message || "Error");
    }
  };

  return (
    <main className="center-wrap">
      <div className="auth-card">
        <div className="auth-head">
          <div className="auth-brand">G</div>
          <div>
            <div className="auth-title">Crear cuenta</div>
            <div className="auth-sub">Es gratis y rápido</div>
          </div>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          <input className="input" type="email" placeholder="Email" required value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="text" placeholder="Nombre (opcional)" value={name} onChange={e=>setName(e.target.value)} />
          <input className="input" type="password" placeholder="Password (min 8)" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="auth-actions">
            <button className="btn" type="submit">Registrar</button>
            <Link className="btn secondary" href="/ui">Iniciar sesión</Link>
          </div>
          {msg && <div className="small-muted" style={{
            color: msg.startsWith("Creando") ? "var(--muted)" : msg.startsWith("Cuenta creada") ? "var(--ok)" : "var(--err)"
          }}>{msg}</div>}
        </form>
        <div className="hr-text">o</div>
        <div className="small-muted">¿Ya tienes cuenta? <Link href="/ui">Accede aquí</Link></div>
      </div>
    </main>
  );
}
