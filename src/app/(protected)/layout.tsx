import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/features/auth/actions/auth.actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const navigation = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/internships", label: "Estágios" },
  { href: "/activities", label: "Atividades" },
  { href: "/profile", label: "Perfil" },
] as const;

function roleLabel(role: "student" | "advisor" | "coordinator" | undefined) {
  switch (role) {
    case "advisor":
      return "Orientador";
    case "coordinator":
      return "Coordenador";
    default:
      return "Estudante";
  }
}

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const supabase = await createClient();
  const { data: claimsData, error } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const userId = claims?.sub;

  if (error || !userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,role")
    .eq("id", userId)
    .maybeSingle();

  const email = typeof claims.email === "string" ? claims.email : null;
  const displayName = profile?.full_name ?? email ?? "Usuário StageTrack";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard" className="group">
              <span className="block text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">
                StageTrack
              </span>
              <span className="mt-1 block text-sm font-medium text-slate-500 group-hover:text-slate-700">
                Acompanhamento de estágio
              </span>
            </Link>

            <form action={logoutAction} className="lg:hidden">
              <button
                type="submit"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Sair
              </button>
            </form>
          </div>

          <nav aria-label="Navegação principal" className="overflow-x-auto">
            <div className="flex min-w-max gap-1 rounded-2xl bg-slate-100 p-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <div className="text-right">
              <p className="max-w-52 truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>
              <p className="text-xs text-slate-500">{roleLabel(profile?.role)}</p>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
