export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, Segoe UI, Roboto, Arial" }}>
        {children}
      </body>
    </html>
  );
}
