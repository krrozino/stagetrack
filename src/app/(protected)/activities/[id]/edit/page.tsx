import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getActivity,
  updateActivityAction,
} from "@/features/activities";

type EditActivityPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditActivityPage({
  params,
  searchParams,
}: EditActivityPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const result = await getActivity(id);

  if (!result.ok || !result.data) {
    notFound();
  }

  const activity = result.data;
  const editable = activity.status === "draft" || activity.status === "submitted";

  if (!editable) {
    return (
      <div className="space-y-6">
        <Link
          href="/activities"
          className="inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Voltar para atividades
        </Link>
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Registro bloqueado
          </p>
          <h1 className="mt-2 text-2xl font-bold text-amber-950 dark:text-amber-50">
            Esta atividade já foi revisada.
          </h1>
          <p className="mt-3 text-sm leading-6 text-amber-800 dark:text-amber-200">
            Atividades aprovadas ou rejeitadas preservam o histórico e não podem mais ser alteradas pelo aluno.
          </p>
        </section>
      </div>
    );
  }

  const action = updateActivityAction.bind(null, activity.id);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <Link
          href="/activities"
          className="inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Voltar para atividades
        </Link>
        <p className="mt-6 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          Editar registro
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          Ajustar atividade
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Enquanto o registro estiver pendente, você pode corrigir horários, turma e descrição. A duração será recalculada automaticamente.
        </p>
      </div>

      {query.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {query.error === "invalid"
            ? "Revise a data, os horários e a descrição da atividade."
            : "Não foi possível editar este registro. Ele pode já ter sido revisado."}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <form action={action} className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Data</span>
            <input
              required
              type="date"
              name="activityDate"
              defaultValue={activity.activity_date}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Turma / grupo</span>
            <input
              type="text"
              name="groupLabel"
              defaultValue={activity.group_label ?? ""}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Início</span>
            <input
              required
              type="time"
              name="startTime"
              defaultValue={activity.start_time.slice(0, 5)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Fim</span>
            <input
              required
              type="time"
              name="endTime"
              defaultValue={activity.end_time.slice(0, 5)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Professor / supervisor presente
            </span>
            <input
              type="text"
              name="teacherName"
              defaultValue={activity.teacher_name ?? ""}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Descrição da atividade
            </span>
            <textarea
              required
              name="description"
              rows={4}
              defaultValue={activity.description}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Observações</span>
            <textarea
              name="notes"
              rows={3}
              defaultValue={activity.notes ?? ""}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <div className="sm:col-span-2 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              A edição preserva o status pendente e atualiza a carga horária automaticamente.
            </p>
            <div className="flex gap-3">
              <Link
                href="/activities"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white transition hover:bg-indigo-500"
              >
                Salvar alterações
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
