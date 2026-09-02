import Link from "next/link";

import { changeAdvisorRoleAction } from "../actions/coordination.actions";
import type { ManageableProfile } from "../types";

export function ProfileRoleCard({ profile }: { profile: ManageableProfile }) {
  const nextRole = profile.role === "student" ? "advisor" : "student";
  const action = changeAdvisorRoleAction.bind(null, profile.id);
  const blocked = profile.role === "advisor" && profile.assignedInternshipCount > 0;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                profile.role === "advisor"
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              {profile.role === "advisor" ? "Orientador" : "Estudante"}
            </span>
            {profile.assignedInternshipCount > 0 ? (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {profile.assignedInternshipCount} estágio(s) atribuído(s)
              </span>
            ) : null}
          </div>

          <h2 className="mt-3 truncate text-base font-bold text-slate-950 dark:text-white">
            {profile.fullName}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {profile.registrationNumber
              ? `Matrícula ${profile.registrationNumber}`
              : "Sem matrícula informada"}
          </p>
        </div>

        {blocked ? (
          <div className="sm:text-right">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Desvincule os estágios antes de remover o papel.
            </p>
            <Link
              href="/coordination"
              className="mt-2 inline-flex text-sm font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Ver atribuições →
            </Link>
          </div>
        ) : (
          <form action={action} className="shrink-0">
            <input type="hidden" name="role" value={nextRole} />
            <button
              type="submit"
              className={`inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-bold transition sm:w-auto ${
                profile.role === "student"
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "border border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
              }`}
            >
              {profile.role === "student"
                ? "Tornar orientador"
                : "Remover papel de orientador"}
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
