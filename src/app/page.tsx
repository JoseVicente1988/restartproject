import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <div className="card">
        <h1 style={{marginTop:0}}>GroFriends</h1>
        <p className="muted">Listas, metas, feed y amigos — rápido y sin humo.</p>
        <div className="row" style={{marginTop:12}}>
          <Link className="btn" href="/ui">Entrar</Link>
          <Link className="btn secondary" href="/ui/register">Crear cuenta</Link>
        </div>
      </div>
    </main>
  );
}
