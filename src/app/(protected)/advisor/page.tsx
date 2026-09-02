import { redirect } from "next/navigation";

import { getAdvisorWorkspace } from "@/features/advisor";
import { PendingReviewCard } from "@/features/advisor/components/pending-review-card";
import { ReviewedActivityCard } from "@/features/advisor/components/reviewed-activity-card";
import type { ActivityStatusEvent } from "@/features/activities";

type AdvisorPageProps = {
  searchParams: Promise<{ reviewed?: string; error?: string }>;
};

export default async function AdvisorPage({ searchParams }: AdvisorPageProps) {
  const params = await searchParams;
  const result = await getAdvisorWorkspace();

  if (!result.ok && result.error.code === "reviewer_role_required") {
    redirect("/dashboard");
  }

  if (!result.ok) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8 dark:border-amber-900 dark:bg-amber-950/40">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Revisões</p>
        <h1 className="mt-2 text-2xl font-bold text-amber-950 dark:text-amber-50">
          Não foi possível carregar sua fila agora.
        </h1>
      </section>
    );
  }

  const workspace = result.data;
  const eventsByActivity = new Map<string, ActivityStatusEvent[]>();

  workspace.events.forEach((event) => {
    const current = eventsByActivity.get(event.activity_id) ?? [];
    current.push(event);
    eventsByActivity.set(event.activity_id, current);
  });

  return (
    <div className="space-y-7 sm:space-y-9">
      {params.reviewed === "approved" ? (
        <Notice tone="success">Atividade aprovada e registrada no histórico.</Notice>
      ) : null}
      {params.reviewed === "rejected" ? (
        <Notice tone="success">Atividade rejeitada e retirada das horas contabilizadas.</Notice>
      ) : null}
      {params.error ? (
        <Notice tone="error">
          {params.error === "invalid"
            ? "Para rejeitar uma atividade, informe uma justificativa com pelo menos 3 caracteres."
            : "Esta atividade não está mais disponível para revisão ou não pertence a um estágio atribuído a você."}
        </Notice>
      ) : null}

      <section>
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Área do orientador</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          Revisão de atividades
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Analise os registros dos estudantes formalmente atribuídos a você. Cada decisão fica preservada na trilha de histórico.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric value={String(workspace.internships.length)} label="Estágios atribuídos" />
        <Metric value={String(workspace.pending.length)} label="Aguardando revisão" />
        <Metric value={String(workspace.reviewed.length)} label="Revisões recentes" />
      </section>

      {workspace.internships.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Nenhum estágio atribuído</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Quando um estágio for vinculado ao seu perfil, as pendências aparecerão automaticamente aqui.
          </p>
        </section>
      ) : (
        <>
          <section>
            <SectionHeading label="Fila" title="Aguardando sua decisão" count={workspace.pending.length} />
            {workspace.pending.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/70 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="font-bold text-emerald-900 dark:text-emerald-100">Fila zerada.</p>
                <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                  Não há atividades pendentes de validação neste momento.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {workspace.pending.map((activity) => (
                  <PendingReviewCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeading label="Histórico" title="Revisões recentes" />
            {workspace.reviewed.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-7 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Suas primeiras aprovações e rejeições aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {workspace.reviewed.map((activity) => (
                  <ReviewedActivityCard
                    key={activity.id}
                    activity={activity}
                    events={eventsByActivity.get(activity.id) ?? []}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function SectionHeading({ label, title, count }: { label: string; title: string; count?: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{label}</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
      </div>
      {count !== undefined ? (
        <span className="text-sm text-slate-500 dark:text-slate-400">{count} pendência(s)</span>
      ) : null}
    </div>
  );
}

function Notice({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  const classes = tone === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
    : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200";

  return <div className={`rounded-2xl border p-4 text-sm font-semibold ${classes}`}>{children}</div>;
}
