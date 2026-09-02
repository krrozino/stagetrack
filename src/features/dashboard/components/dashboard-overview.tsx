import Link from "next/link";

import { formatDuration, formatShortDate } from "../formatters";
import type { DashboardViewModel } from "../types";
import { InternshipProgressCard } from "./internship-progress-card";
import { MetricCard } from "./metric-card";
import { RecentActivitiesCard } from "./recent-activities-card";

type DashboardOverviewProps = {
  model: DashboardViewModel;
};

export function DashboardOverview({ model }: DashboardOverviewProps) {
  const internship = model.internship;
  const remainingMinutes = internship
    ? Math.max(0, internship.requiredMinutes - internship.completedMinutes)
    : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-600">Visão geral</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Acompanhe seu estágio em um só lugar.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Horas, atividades e progresso ficam organizados aqui conforme sua
            jornada de estágio avança.
          </p>
        </div>

        <Link
          href={internship ? "/internships" : "/internships/new"}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-500"
        >
          {internship ? "Ver Meu Estágio" : "Configurar Meu Estágio"}
        </Link>
      </section>

      {!internship ? (
        <section className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3.5 text-sm leading-6 text-indigo-800">
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-indigo-600 shadow-sm"
            aria-hidden="true"
          >
            i
          </span>
          <p>
            Você ainda não possui um estágio cadastrado. Os indicadores abaixo
            estão em estado inicial e serão preenchidos automaticamente quando
            o acompanhamento começar.
          </p>
        </section>
      ) : null}

      <section aria-label="Indicadores do estágio" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Horas realizadas"
          value={formatDuration(internship?.completedMinutes ?? 0)}
          helper={
            internship
              ? "Somatório das atividades consideradas no acompanhamento."
              : "Começará a contar após o primeiro registro."
          }
          accent="indigo"
        />
        <MetricCard
          label="Horas restantes"
          value={remainingMinutes === null ? "—" : formatDuration(remainingMinutes)}
          helper={
            internship
              ? "Quanto falta para atingir a carga horária mínima."
              : "Disponível após definir a carga horária do estágio."
          }
          accent="amber"
        />
        <MetricCard
          label="Atividades"
          value={String(model.activityCount)}
          helper={
            model.activityCount > 0
              ? "Registros realizados neste acompanhamento."
              : "Nenhuma atividade registrada até agora."
          }
          accent="emerald"
        />
        <MetricCard
          label="Último registro"
          value={formatShortDate(model.lastActivityAt)}
          helper={
            model.lastActivityAt
              ? "Data da atividade mais recente."
              : "Ainda não existe um registro de atividade."
          }
          accent="slate"
        />
      </section>

      <InternshipProgressCard internship={internship} />

      <RecentActivitiesCard
        activities={model.recentActivities}
        hasInternship={Boolean(internship)}
      />
    </div>
  );
}
