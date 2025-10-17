"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function LoginPage(){
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [msg,setMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("Autenticando…");
    try{
      const j = await api("/api/auth/login",{ method:"POST", body: JSON.stringify({ email: email.trim().toLowerCase(), password })});
      if (j.ok) window.location.href = "/app";
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
            <div className="auth-title">GroFriends</div>
            <div className="auth-sub">Accede a tu cuenta</div>
          </div>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          <input className="input" type="email" placeholder="Email" required value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="auth-actions">
            <button className="btn" type="submit">Entrar</button>
            <Link className="btn secondary" href="/ui/register">Crear cuenta</Link>
          </div>
          {msg && <div className="small-muted" style={{color: msg.startsWith("Autenticando") ? "var(--muted)" : "var(--err)"}}>{msg}</div>}
        </form>
        <div className="hr-text">o</div>
        <div className="small-muted">¿Sin cuenta? <Link href="/ui/register">Regístrate</Link></div>
      </div>
    </main>
  );
}
