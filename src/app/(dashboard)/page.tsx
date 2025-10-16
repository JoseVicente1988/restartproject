import Link from "next/link";
import type { Route } from "next";

export default function Page() {
  return (
    <div>
      <p>Accesos rápidos:</p>
      <div className="mt-3 flex gap-2">
        <Link className="btn" href={"/es/list" as Route}>Lista</Link>
        <Link className="btn" href={"/es/feed" as Route}>Tablón</Link>
        <Link className="btn" href={"/es/friends" as Route}>Amigos</Link>
      </div>
    </div>
  );
}
