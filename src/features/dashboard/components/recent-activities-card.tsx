import Link from "next/link";

import { formatDuration, formatShortDate } from "../formatters";
import type { DashboardActivitySummary } from "../types";

type RecentActivitiesCardProps = {
  activities: DashboardActivitySummary[];
  hasInternship: boolean;
};

const statusLabel = {
  draft: "Rascunho",
  submitted: "Enviada",
  approved: "Aprovada",
  rejected: "Correção necessária",
} as const;

const statusClasses = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
} as const;

export function RecentActivitiesCard({
  activities,
  hasInternship,
}: RecentActivitiesCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-950">
            Atividades recentes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Seus últimos registros de estágio.
          </p>
        </div>

        <Link
          href="/activities"
          className="shrink-0 text-sm font-bold text-indigo-600 transition hover:text-indigo-500"
        >
          Ver todas
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="px-5 py-10 text-center sm:px-6 sm:py-12">
          <span
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400"
            aria-hidden="true"
          >
            ≡
          </span>
          <h3 className="mt-4 text-base font-bold text-slate-900">
            {hasInternship
              ? "Nenhuma atividade registrada"
              : "As atividades aparecerão aqui"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {hasInternship
              ? "Quando você registrar uma atividade, ela entrará automaticamente neste histórico recente."
              : "Primeiro cadastre seu estágio. Depois, cada registro de atividade será resumido nesta seção."}
          </p>
          <Link
            href={hasInternship ? "/activities" : "/internships"}
            className="mt-5 inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
          >
            {hasInternship ? "Registrar atividade" : "Ir para Meu Estágio"}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activities.map((activity) => (
            <article
              key={activity.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-slate-900">
                    {formatShortDate(activity.date)}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClasses[activity.status]}`}
                  >
                    {statusLabel[activity.status]}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                  {activity.description}
                </p>
              </div>

              <span className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                {formatDuration(activity.durationMinutes)}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
