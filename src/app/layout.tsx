import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GroFriends",
  description: "Lista de compra + social + metas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
