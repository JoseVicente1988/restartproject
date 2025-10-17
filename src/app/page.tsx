import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>GroFriends</h1>
      <p><Link href="/ui">Entrar</Link> · <Link href="/ui/register">Crear cuenta</Link></p>
    </main>
  );
}
