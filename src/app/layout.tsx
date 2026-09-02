import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StageTrack",
  description: "Acompanhamento simples e organizado de estágios supervisionados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
