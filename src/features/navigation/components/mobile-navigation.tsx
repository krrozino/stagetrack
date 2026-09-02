"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  authenticatedNavigation,
  isNavigationItemActive,
} from "../config/authenticated-navigation";
import { NavigationIcon } from "./navigation-icon";

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-[0_-8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {authenticatedNavigation.map((item) => {
          const active = isNavigationItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold transition ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <NavigationIcon
                name={item.icon}
                className={`h-5 w-5 ${active ? "stroke-[2.2]" : ""}`}
              />
              <span className="max-w-full truncate">{item.mobileLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
