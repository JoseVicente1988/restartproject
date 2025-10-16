import "./../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compra Social",
  description: "Lista de la compra + red social mínima"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
