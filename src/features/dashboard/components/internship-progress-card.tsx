import Link from "next/link";

import { formatDuration, progressPercentage } from "../formatters";
import type { DashboardInternshipSummary } from "../types";

const STATUS_LABELS = {
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
  completed: "Concluído",
  cancelled: "Cancelado",
} as const;

type InternshipProgressCardProps = {
  internship: DashboardInternshipSummary | null;
};

export function InternshipProgressCard({
  internship,
}: InternshipProgressCardProps) {
  if (!internship) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-8">
        <div
          className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 right-20 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-2xl">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-indigo-200">
            Progresso do estágio
          </span>

          <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
            Comece cadastrando seu estágio.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
            Assim que um estágio estiver ativo, o StageTrack mostrará aqui a
            carga horária realizada, o que falta cumprir e o avanço percentual.
          </p>

          <div className="mt-7">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Horas concluídas</span>
              <span>0%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-0 rounded-full bg-indigo-400" />
            </div>
          </div>

          <Link
            href="/internships/new"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-indigo-50"
          >
            Cadastrar estágio
          </Link>
        </div>
      </section>
    );
  }

  const progress = progressPercentage(
    internship.completedMinutes,
    internship.requiredMinutes,
  );
  const remainingMinutes = Math.max(
    0,
    internship.requiredMinutes - internship.completedMinutes,
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">
              Progresso do estágio
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200">
              {STATUS_LABELS[internship.status]}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight">
            {internship.title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {internship.organizationName}
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 px-4 py-3 sm:text-right">
          <p className="text-2xl font-black">{Math.round(progress)}%</p>
          <p className="text-xs text-slate-400">concluído</p>
        </div>
      </div>

      <div className="mt-7 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-indigo-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-slate-400">Realizadas</p>
          <p className="mt-1 text-lg font-bold">
            {formatDuration(internship.completedMinutes)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-slate-400">Restantes</p>
          <p className="mt-1 text-lg font-bold">{formatDuration(remainingMinutes)}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-slate-400">Carga mínima</p>
          <p className="mt-1 text-lg font-bold">
            {formatDuration(internship.requiredMinutes)}
          </p>
        </div>
      </div>
    </section>
  );
}
