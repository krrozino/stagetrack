import type { ActivityStatusEvent } from "@/features/activities";

import type { ReviewQueueItem } from "../types";

const STATUS_LABELS = {
  draft: "Rascunho",
  submitted: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
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

function eventDateLabel(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function ReviewedActivityCard({
  activity,
  events,
}: {
  activity: ReviewQueueItem;
  events: ActivityStatusEvent[];
}) {
  const approved = activity.status === "approved";
  const orderedEvents = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                approved
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
              }`}
            >
              {STATUS_LABELS[activity.status]}
            </span>
            <span className="text-xs text-slate-400">
              {activity.reviewed_at ? eventDateLabel(activity.reviewed_at) : ""}
            </span>
          </div>
          <h3 className="mt-2 font-bold text-slate-950 dark:text-white">
            {activity.internship.studentName} · {dateLabel(activity.activity_date)}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {durationLabel(activity.duration_minutes)} · {activity.description}
          </p>
          {activity.review_comment ? (
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              Parecer: {activity.review_comment}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right text-xs text-slate-400">
          {orderedEvents.map((event, index) => (
            <p key={event.id} className={index > 0 ? "mt-1" : ""}>
              {event.from_status ? `${STATUS_LABELS[event.from_status]} → ` : ""}
              {STATUS_LABELS[event.to_status]}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
