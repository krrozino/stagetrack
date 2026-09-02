import { reviewActivityAction } from "../actions/activity-review.actions";
import type { ReviewQueueItem } from "../types";

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

export function PendingReviewCard({ activity }: { activity: ReviewQueueItem }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Pendente
            </span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {durationLabel(activity.duration_minutes)}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">
            {activity.internship.studentName}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {activity.internship.internshipTypeName} · {activity.internship.organizationName}
            {activity.internship.registrationNumber
              ? ` · ${activity.internship.registrationNumber}`
              : ""}
          </p>

          <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
            {dateLabel(activity.activity_date)} · {activity.start_time.slice(0, 5)}–{activity.end_time.slice(0, 5)}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
            {activity.description}
          </p>

          {activity.group_label || activity.teacher_name || activity.notes ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              {activity.group_label ? <p>Turma: {activity.group_label}</p> : null}
              {activity.teacher_name ? <p>Professor: {activity.teacher_name}</p> : null}
              {activity.notes ? <p className="mt-2">Observações: {activity.notes}</p> : null}
            </div>
          ) : null}
        </div>

        <form
          action={reviewActivityAction}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:w-80 dark:border-slate-700 dark:bg-slate-950"
        >
          <input type="hidden" name="activityId" value={activity.id} />
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Parecer / justificativa
            </span>
            <textarea
              name="comment"
              rows={4}
              maxLength={2000}
              placeholder="Opcional para aprovação; obrigatório para rejeição."
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="submit"
              name="decision"
              value="rejected"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
            >
              Rejeitar
            </button>
            <button
              type="submit"
              name="decision"
              value="approved"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white transition hover:bg-emerald-500"
            >
              Aprovar
            </button>
          </div>
        </form>
      </div>
    </article>
  );
}
