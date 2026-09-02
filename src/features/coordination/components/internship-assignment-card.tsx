import { assignAdvisorAction } from "../actions/coordination.actions";
import type {
  AdvisorCandidate,
  CoordinationInternship,
} from "../types";

const STATUS_LABELS: Record<CoordinationInternship["status"], string> = {
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

function dateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
}

export function InternshipAssignmentCard({
  internship,
  advisors,
}: {
  internship: CoordinationInternship;
  advisors: AdvisorCandidate[];
}) {
  const action = assignAdvisorAction.bind(null, internship.id);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {STATUS_LABELS[internship.status]}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Início em {dateLabel(internship.startDate)}
            </span>
          </div>

          <h2 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">
            {internship.studentName}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {internship.registrationNumber
              ? `Matrícula ${internship.registrationNumber} · `
              : ""}
            {internship.internshipTypeName}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {internship.organizationName}
          </p>

          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-950">
            <span className="text-slate-500 dark:text-slate-400">Orientador atual: </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {internship.advisorName ?? "Não atribuído"}
            </span>
          </div>
        </div>

        <form action={action} className="w-full max-w-md shrink-0">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Orientador responsável
            </span>
            <select
              name="advisorId"
              defaultValue={internship.advisorId ?? ""}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Sem orientador</option>
              {advisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.fullName}
                  {advisor.role === "coordinator" ? " · Coordenador" : ""}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Salvar vínculo
          </button>
        </form>
      </div>
    </article>
  );
}
