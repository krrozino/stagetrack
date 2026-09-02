import type { Metadata } from "next";

import { ThemeToggle } from "@/features/theme/theme-toggle";

import "./globals.css";

export const metadata: Metadata = {
  title: "StageTrack",
  description: "Acompanhamento simples e organizado de estágios supervisionados.",
};

const themeBootstrap = `
  try {
    const stored = localStorage.getItem("stagetrack-theme");
    const theme = stored === "dark" || stored === "light"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
