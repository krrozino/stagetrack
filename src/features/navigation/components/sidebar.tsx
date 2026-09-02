"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/features/auth/actions/auth.actions";

import {
  getAuthenticatedNavigation,
  isNavigationItemActive,
  type NavigationRole,
} from "../config/authenticated-navigation";
import { NavigationIcon } from "./navigation-icon";

type SidebarProps = {
  displayName: string;
  roleLabel: string;
  role: NavigationRole;
  email: string | null;
};

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST"
  );
}

function homeHref(role: NavigationRole) {
  if (role === "student") return "/dashboard";
  if (role === "coordinator") return "/coordination";
  return "/advisor";
}

export function Sidebar({ displayName, roleLabel, role, email }: SidebarProps) {
  const pathname = usePathname();
  const navigation = getAuthenticatedNavigation(role);

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-100 px-6 py-7 dark:border-slate-800">
        <Link href={homeHref(role)} className="inline-flex items-center gap-3 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black tracking-tight text-white shadow-sm shadow-indigo-200 transition group-hover:bg-indigo-500 dark:shadow-none">
            ST
          </span>
          <span>
            <span className="block text-base font-black tracking-tight text-slate-950 dark:text-white">
              StageTrack
            </span>
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              Gestão de estágio
            </span>
          </span>
        </Link>
      </div>

      <nav aria-label="Navegação principal" className="flex-1 px-4 py-6">
        <p className="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Navegação
        </p>

        <div className="mt-3 space-y-1.5">
          {navigation.map((item) => {
            const active = isNavigationItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                  active
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-200 dark:ring-indigo-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    active
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300"
                      : "bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:bg-slate-800 dark:group-hover:text-slate-200"
                  }`}
                >
                  <NavigationIcon name={item.icon} />
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-bold">{item.label}</span>
                  <span
                    className={`mt-0.5 block truncate text-xs ${
                      active ? "text-indigo-500 dark:text-indigo-300" : "text-slate-400"
                    }`}
                  >
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-950">
              {initials(displayName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{displayName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {roleLabel}{email ? ` · ${email}` : ""}
              </p>
            </div>
          </div>

          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Sair da conta
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
