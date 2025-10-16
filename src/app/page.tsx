import Link from "next/link";

export default function Landing() {
  return (
    <main className="container py-16">
      <div className="max-w-2xl mx-auto card">
        <h1 className="text-3xl font-semibold mb-2">Compra Social</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Gestiona tu lista, comparte tus logros y chatea con tus amigos.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/es/register" className="btn">Crear cuenta</Link>
          <Link href="/es/login" className="btn">Entrar</Link>
        </div>
      </div>
    </main>
  );
}
