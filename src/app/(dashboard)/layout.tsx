import Link from "next/link";
import type { Route } from "next";
type Locale = "es" | "en";

const loginHref = (locale: Locale): Route =>
  (locale === "es" ? "/es/login" : "/en/login") as Route;

const registerHref = (locale: Locale): Route =>
  (locale === "es" ? "/es/register" : "/en/register") as Route;

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const { locale } = params;

  return (
    <header>
      <Link className="btn" href={loginHref(locale)}>Entrar</Link>
      <Link className="btn" href={registerHref(locale)}>Crear cuenta</Link>
    </header>
  );
}
