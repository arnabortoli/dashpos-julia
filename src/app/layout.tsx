import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Radar de Atendimento · Loumar",
  description:
    "Desenvolvimento, escuta e qualidade no Pós-Vendas da Loumar. Demonstração com dados inteiramente simulados.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
