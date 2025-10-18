import "./globals.css";
import type { Metadata } from "next";
import JsonSafePatch from "@/components/JsonSafePatch";

export const metadata: Metadata = {
  title: "GroFriends",
  description: "Lista de la compra con feed, metas y amigos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="light">
      <body>
        {/* Parche global: evita 'Unexpected end of JSON input' */}
        <JsonSafePatch />
        {children}
      </body>
    </html>
  );
}
