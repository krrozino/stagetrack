import Link from "next/link";

import { changeInternshipStatusAction } from "@/features/internships/actions/internship-status.actions";
import {
  listStudentInternshipOverviews,
  type InternshipOverview,
} from "@/features/internships";

const STATUS_LABELS = {
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
  completed: "Concluído",
  cancelled: "Cancelado",
} as const;

const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-700",
  active: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800",
  completed: "bg-indigo-100 text-indigo-800",
  cancelled: "bg-rose-100 text-rose-800",
} as const;

function minutesLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0
    ? `${hours}h`
    : `${hours}h${String(remaining).padStart(2, "0")}`;
}

function dateLabel(date: string | null) {
  if (!date) {
    return "Não informada";
  }

  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
}

function StatusBadge({ status }: { status: InternshipOverview["status"] }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function StatusAction({
  internshipId,
  status,
  label,
  danger = false,
}: {
  internshipId: string;
  status: "active" | "paused" | "cancelled";
  label: string;
  danger?: boolean;
}) {
  return (
    <form action={changeInternshipStatusAction}>
      <input type="hidden" name="internshipId" value={internshipId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={
          danger
            ? "rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            : "rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        }
      >
        {label}
      </button>
    </form>
  );
}

function InternshipActions({ internship }: { internship: InternshipOverview }) {
  if (internship.status === "draft") {
    return (
      <div className="flex flex-wrap gap-2">
        <StatusAction internshipId={internship.id} status="active" label="Ativar estágio" />
        <StatusAction internshipId={internship.id} status="cancelled" label="Cancelar" danger />
      </div>
    );
  }

  if (internship.status === "active") {
    return (
      <div className="flex flex-wrap gap-2">
        <StatusAction internshipId={internship.id} status="paused" label="Pausar" />
        <StatusAction internshipId={internship.id} status="cancelled" label="Cancelar" danger />
      </div>
    );
  }

  if (internship.status === "paused") {
    return (
      <div className="flex flex-wrap gap-2">
        <StatusAction internshipId={internship.id} status="active" label="Retomar estágio" />
        <StatusAction internshipId={internship.id} status="cancelled" label="Cancelar" danger />
      </div>
    );
  }

  return null;
}

type InternshipsPageProps = {
  searchParams: Promise<{
    created?: string;
    statusUpdated?: string;
    statusError?: string;
  }>;
};

export default async function InternshipsPage({ searchParams }: InternshipsPageProps) {
  const [params, internshipsResult] = await Promise.all([
    searchParams,
    listStudentInternshipOverviews(),
  ]);

  if (!internshipsResult.ok) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <p className="text-sm font-semibold text-amber-800">Meu Estágio</p>
        <h1 className="mt-2 text-2xl font-bold text-amber-950">
          Não foi possível carregar seus estágios.
        </h1>
        <p className="mt-3 text-sm text-amber-800">
          Atualize a página e tente novamente.
        </p>
      </section>
    );
  }

  const internships = internshipsResult.data;
  const current =
    internships.find((internship) =>
      ["active", "paused", "draft"].includes(internship.status),
    ) ?? internships[0];
  const history = current
    ? internships.filter((internship) => internship.id !== current.id)
    : [];

  return (
    <div className="space-y-6">
      {params.created === "1" && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
        >
          Estágio cadastrado com sucesso. Ele foi criado como rascunho e já está protegido pela sua conta.
        </div>
      )}

      {params.statusUpdated === "1" && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
        >
          Status do estágio atualizado com sucesso.
        </div>
      )}

      {params.statusError === "1" && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800"
        >
          Essa alteração de status não é permitida para o estágio atual.
        </div>
      )}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">Meu Estágio</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Seu acompanhamento supervisionado
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Consulte o vínculo atual, carga obrigatória, instituição concedente e histórico acadêmico.
          </p>
        </div>
        <Link
          href="/internships/new"
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Cadastrar outro estágio
        </Link>
      </section>

      {!current ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Nenhum estágio cadastrado ainda
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Comece selecionando seu curso, modalidade e instituição concedente. A carga obrigatória será preenchida automaticamente.
          </p>
          <Link
            href="/internships/new"
            className="mt-5 inline-flex font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Cadastrar meu primeiro estágio →
          </Link>
        </section>
      ) : (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={current.status} />
                  <span className="text-sm font-semibold text-indigo-600">
                    {minutesLabel(current.required_minutes)} obrigatórias
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-950">
                  {current.internship_types.name}
                </h2>
                {current.internship_types.description && (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {current.internship_types.description}
                  </p>
                )}
              </div>
              <InternshipActions internship={current} />
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Concedente
                </p>
                <p className="mt-2 font-semibold text-slate-950">
                  {current.organizations.name}
                </p>
                {(current.organizations.city || current.organizations.state) && (
                  <p className="mt-1 text-sm text-slate-500">
                    {[current.organizations.city, current.organizations.state]
                      .filter(Boolean)
                      .join(" — ")}
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Supervisor
                </p>
                <p className="mt-2 font-semibold text-slate-950">
                  {current.supervisors?.name ?? "Ainda não informado"}
                </p>
                {current.supervisors?.position && (
                  <p className="mt-1 text-sm text-slate-500">
                    {current.supervisors.position}
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Data de início
                </p>
                <p className="mt-2 font-semibold text-slate-950">
                  {dateLabel(current.start_date)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Previsão de término
                </p>
                <p className="mt-2 font-semibold text-slate-950">
                  {dateLabel(current.expected_end_date)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              O progresso por horas será conectado na Sprint 2, quando os registros de atividades começarem a alimentar este estágio.
            </div>
          </section>

          {history.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-950">Histórico de estágios</h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {history.map((internship) => (
                  <article
                    key={internship.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <StatusBadge status={internship.status} />
                      <span className="text-sm font-semibold text-indigo-600">
                        {minutesLabel(internship.required_minutes)}
                      </span>
                    </div>
                    <h3 className="mt-4 font-bold text-slate-950">
                      {internship.internship_types.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {internship.organizations.name}
                    </p>
                    <p className="mt-4 text-sm text-slate-500">
                      {dateLabel(internship.start_date)} → {dateLabel(internship.expected_end_date)}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
