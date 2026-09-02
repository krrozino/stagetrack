"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/features/auth/actions/auth.actions";

import { findActiveNavigationItem } from "../config/authenticated-navigation";

type AuthenticatedHeaderProps = {
  displayName: string;
  roleLabel: string;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ST";
}

export function AuthenticatedHeader({
  displayName,
  roleLabel,
}: AuthenticatedHeaderProps) {
  const pathname = usePathname();
  const activeItem = findActiveNavigationItem(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="flex min-h-18 items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:min-h-20 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-xs font-black text-white shadow-sm shadow-indigo-200 dark:shadow-none lg:hidden"
            aria-label="Ir para o dashboard"
          >
            ST
          </Link>

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              {activeItem ? activeItem.label : "StageTrack"}
            </p>
            <h1 className="mt-0.5 truncate text-base font-bold tracking-tight text-slate-950 dark:text-white sm:text-lg">
              {activeItem?.description ?? "Acompanhamento de estágio"}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 sm:flex lg:mr-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sessão protegida
          </div>

          <div className="hidden text-right xl:block">
            <p className="max-w-44 truncate text-sm font-bold text-slate-900 dark:text-white">
              {displayName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabel}</p>
          </div>

          <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white dark:bg-slate-100 dark:text-slate-950 xl:flex">
            {initials(displayName)}
          </span>

          <form action={logoutAction} className="lg:hidden">
            <button
              type="submit"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
