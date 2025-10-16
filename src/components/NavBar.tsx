import Link from "next/link";

export default function NavBar({ locale }: { locale: "es" | "en" }) {
  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="container py-3 flex items-center gap-4">
        <Link href={`/${locale}`} className="font-semibold">🏷️ Compra Social</Link>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <Link href={`/${locale}/list`}>Lista</Link>
          <Link href={`/${locale}/feed`}>Tablón</Link>
          <Link href={`/${locale}/friends`}>Amigos</Link>
          <Link href={`/${locale}`}>Inicio</Link>
        </div>
      </div>
    </nav>
  );
}
