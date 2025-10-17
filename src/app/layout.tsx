import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = "pastel"; // fallback; el cliente lo cambia y guarda en localStorage
  return (
    <html lang="es">
      <body data-theme={theme}>{children}</body>
    </html>
  );
}
