import { getUserFromCookie } from "@/lib/auth";
import Link from "next/link";

export default function HomeDash() {
  const user = getUserFromCookie();

  return (
    <div className="grid2">
      <div className="card">
        <h2 className="font-semibold mb-2">Bienvenido{user ? `, ${user.name}` : ""}</h2>
        <p>Accesos rápidos:</p>
        <div className="mt-3 flex gap-2">
          <Link className="btn" href="/es/list">Lista</Link>
          <Link className="btn" href="/es/feed">Tablón</Link>
          <Link className="btn" href="/es/friends">Amigos</Link>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-2">Opciones</h3>
        <p>Puedes cambiar tema e idioma arriba. Para borrar la cuenta, ve al final de esta página.</p>
        <form className="mt-4" action="/api/auth/delete" method="post">
          <button className="btn border-red-500">Borrar cuenta</button>
        </form>
      </div>
    </div>
  );
}
