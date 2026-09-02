import Link from "next/link";

import {
  createActivityAction,
  deleteActivityAction,
  listActivities,
} from "@/features/activities";
import { getCurrentInternshipOverview } from "@/features/internships";

const STATUS_LABELS = {
  draft: "Rascunho",
  submitted: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
} as const;

const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  submitted: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
} as const;

function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0
    ? `${hours}h`
    : `${hours}h${String(remaining).padStart(2, "0")}`;
}

function dateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
}

function timeLabel(time: string) {
  return time.slice(0, 5);
}

type ActivitiesPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
};

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const params = await searchParams;
  const internshipResult = await getCurrentInternshipOverview();

  if (!internshipResult.ok) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8 dark:border-amber-900 dark:bg-amber-950/40">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Atividades</p>
        <h1 className="mt-2 text-2xl font-bold text-amber-950 dark:text-amber-50">
          Não foi possível carregar seu estágio.
        </h1>
      </section>
    );
  }

  const internship = internshipResult.data;
  const activitiesResult = internship
    ? await listActivities(internship.id)
    : { ok: true as const, data: [] };

  if (!activitiesResult.ok) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8 dark:border-amber-900 dark:bg-amber-950/40">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Atividades</p>
        <h1 className="mt-2 text-2xl font-bold text-amber-950 dark:text-amber-50">
          Não foi possível carregar seus registros.
        </h1>
      </section>
    );
  }

  const activities = activitiesResult.data;
  const countedActivities = activities.filter(
    (activity) => activity.status !== "rejected",
  );
  const totalMinutes = countedActivities.reduce(
    (total, activity) => total + activity.duration_minutes,
    0,
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {params.created === "1" ? (
        <Notice tone="success">
          Atividade registrada. A carga horária já entrou no progresso provisório do estágio.
        </Notice>
      ) : null}
      {params.updated === "1" ? (
        <Notice tone="success">
          Atividade atualizada. A duração e o dashboard foram recalculados.
        </Notice>
      ) : null}
      {params.deleted === "1" ? (
        <Notice tone="success">
          Atividade excluída. O progresso foi atualizado automaticamente.
        </Notice>
      ) : null}
      {params.error ? (
        <Notice tone="error">
          {params.error === "invalid"
            ? "Revise a data, os horários e a descrição da atividade."
            : params.error === "delete"
              ? "Não foi possível excluir o registro. Ele pode já ter sido revisado."
              : "Não foi possível concluir a operação. Verifique o estágio e tente novamente."}
        </Notice>
      ) : null}

      <section>
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Atividades</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          Registros de atividades
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Registre cada ida ao estágio. Enquanto o orientador ainda não revisou, você pode corrigir ou remover o registro.
        </p>
      </section>

      {!internship ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Cadastre um estágio antes das atividades
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Cada atividade precisa estar vinculada a um estágio para que as horas sejam contabilizadas corretamente.
          </p>
          <Link
            href="/internships/new"
            className="mt-5 inline-flex font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Configurar meu estágio →
          </Link>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <Metric value={durationLabel(totalMinutes)} label="Horas registradas" />
            <Metric value={String(activities.length)} label="Atividades" />
            <Metric
              value={activities[0] ? dateLabel(activities[0].activity_date) : "—"}
              label="Último registro"
            />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Novo registro</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
                  {internship.internship_types.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {internship.organizations.name}
                </p>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  internship.status === "active"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {internship.status === "active" ? "Estágio ativo" : internship.status}
              </span>
            </div>

            {internship.status !== "active" ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                Ative o estágio em{" "}
                <Link href="/internships" className="font-bold underline">
                  Meu Estágio
                </Link>{" "}
                para registrar novas atividades.
              </div>
            ) : (
              <form action={createActivityAction} className="mt-7 grid gap-5 sm:grid-cols-2">
                <input type="hidden" name="internshipId" value={internship.id} />
                <Field label="Data">
                  <input required type="date" name="activityDate" className={inputClass} />
                </Field>
                <Field label="Turma / grupo">
                  <input type="text" name="groupLabel" placeholder="Ex.: 8º ano A" className={inputClass} />
                </Field>
                <Field label="Início">
                  <input required type="time" name="startTime" className={inputClass} />
                </Field>
                <Field label="Fim">
                  <input required type="time" name="endTime" className={inputClass} />
                </Field>
                <Field label="Professor / supervisor presente" full>
                  <input type="text" name="teacherName" placeholder="Nome do professor acompanhado" className={inputClass} />
                </Field>
                <Field label="Descrição da atividade" full>
                  <textarea required name="description" rows={4} placeholder="Descreva o que foi acompanhado ou realizado durante o estágio." className={textareaClass} />
                </Field>
                <Field label="Observações" full>
                  <textarea name="notes" rows={3} placeholder="Opcional: anotações, ocorrências ou pontos importantes." className={textareaClass} />
                </Field>
                <div className="sm:col-span-2 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                    O registro ficará pendente. Até a revisão, as horas aparecem como provisórias.
                  </p>
                  <button type="submit" className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white transition hover:bg-indigo-500">
                    Registrar atividade
                  </button>
                </div>
              </form>
            )}
          </section>

          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Histórico</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Atividades registradas</h2>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">{activities.length} registro(s)</span>
            </div>

            {activities.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="font-semibold text-slate-900 dark:text-white">Nenhuma atividade registrada ainda.</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  O primeiro registro aparecerá aqui e também alimentará seu dashboard.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {activities.map((activity) => {
                  const editable = activity.status === "draft" || activity.status === "submitted";
                  const deleteAction = deleteActivityAction.bind(null, activity.id);
                  const reviewed = activity.status === "approved" || activity.status === "rejected";

                  return (
                    <article key={activity.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLES[activity.status]}`}>
                              {STATUS_LABELS[activity.status]}
                            </span>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{durationLabel(activity.duration_minutes)}</span>
                          </div>
                          <h3 className="mt-3 font-bold text-slate-950 dark:text-white">
                            {dateLabel(activity.activity_date)} · {timeLabel(activity.start_time)}–{timeLabel(activity.end_time)}
                          </h3>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">{activity.description}</p>

                          {activity.group_label || activity.teacher_name ? (
                            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                              {activity.group_label ? <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800">{activity.group_label}</span> : null}
                              {activity.teacher_name ? <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800">{activity.teacher_name}</span> : null}
                            </div>
                          ) : null}

                          {activity.notes ? (
                            <div className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-500 dark:border-slate-800 dark:text-slate-400">{activity.notes}</div>
                          ) : null}

                          {reviewed ? (
                            <div className={`mt-4 rounded-2xl border p-4 ${activity.status === "approved" ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"}`}>
                              <p className={`text-sm font-bold ${activity.status === "approved" ? "text-emerald-900 dark:text-emerald-100" : "text-rose-900 dark:text-rose-100"}`}>
                                {activity.status === "approved" ? "Atividade validada pelo orientador" : "Atividade não validada pelo orientador"}
                              </p>
                              {activity.review_comment ? (
                                <p className={`mt-2 text-sm leading-6 ${activity.status === "approved" ? "text-emerald-800 dark:text-emerald-200" : "text-rose-800 dark:text-rose-200"}`}>
                                  Parecer: {activity.review_comment}
                                </p>
                              ) : (
                                <p className={`mt-2 text-sm ${activity.status === "approved" ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>
                                  Sem observações adicionais.
                                </p>
                              )}
                              {activity.reviewed_at ? (
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                  Revisado em {new Date(activity.reviewed_at).toLocaleString("pt-BR")}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>

                        {editable ? (
                          <div className="flex shrink-0 gap-2">
                            <Link href={`/activities/${activity.id}/edit`} className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Editar</Link>
                            <details className="relative">
                              <summary className="flex h-10 cursor-pointer list-none items-center rounded-xl border border-rose-200 px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40">Excluir</summary>
                              <div className="absolute right-0 z-10 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Excluir esta atividade?</p>
                                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">As horas serão removidas do progresso. Esta ação não pode ser desfeita.</p>
                                <form action={deleteAction} className="mt-3">
                                  <button type="submit" className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-rose-600 px-3 text-xs font-bold text-white hover:bg-rose-500">Confirmar exclusão</button>
                                </form>
                              </div>
                            </details>
                          </div>
                        ) : (
                          <span className="shrink-0 text-xs font-semibold text-slate-400">Registro bloqueado após revisão</span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

const inputClass = "mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const textareaClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

function Field({ label, full = false, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={full ? "block sm:col-span-2" : "block"}>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
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

function Notice({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  const classes = tone === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
    : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200";

  return <div className={`rounded-2xl border p-4 text-sm font-semibold ${classes}`}>{children}</div>;
}
