import Link from "next/link";

import { listStudentInternships } from "@/features/internships";

const STATUS_LABELS = {
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
  completed: "Concluído",
  cancelled: "Cancelado",
} as const;

function minutesLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0 ? `${hours}h` : `${hours}h${String(remaining).padStart(2, "0")}`;
}

type InternshipsPageProps = {
  searchParams: Promise<{ created?: string }>;
};

export default async function InternshipsPage({ searchParams }: InternshipsPageProps) {
  const [{ created }, internshipsResult] = await Promise.all([
    searchParams,
    listStudentInternships(),
  ]);

  if (!internshipsResult.ok) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <p className="text-sm font-semibold text-amber-800">Meu Estágio</p>
        <h1 className="mt-2 text-2xl font-bold text-amber-950">Não foi possível carregar seus estágios.</h1>
        <p className="mt-3 text-sm text-amber-800">Atualize a página e tente novamente.</p>
      </section>
    );
  }

  const internships = internshipsResult.data;

  return (
    <div className="space-y-6">
      {created === "1" && (
        <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          Estágio cadastrado com sucesso. Ele foi criado como rascunho e já está protegido pela sua conta.
        </div>
      )}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">Meu Estágio</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Seus estágios supervisionados</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Cadastre e acompanhe os vínculos de estágio associados à sua jornada acadêmica.
          </p>
        </div>
        <Link
          href="/internships/new"
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Cadastrar estágio
        </Link>
      </section>

      {internships.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Nenhum estágio cadastrado ainda</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Comece selecionando seu curso, modalidade e instituição concedente. A carga obrigatória será preenchida automaticamente.
          </p>
          <Link href="/internships/new" className="mt-5 inline-flex font-semibold text-indigo-600 hover:text-indigo-500">
            Cadastrar meu primeiro estágio →
          </Link>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {internships.map((internship) => (
            <article key={internship.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
                  {STATUS_LABELS[internship.status]}
                </span>
                <span className="text-sm font-semibold text-indigo-600">{minutesLabel(internship.required_minutes)}</span>
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">Início</p>
              <p className="mt-1 font-semibold text-slate-950">{new Date(`${internship.start_date}T12:00:00`).toLocaleDateString("pt-BR")}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">Previsão de término</p>
              <p className="mt-1 font-semibold text-slate-950">
                {internship.expected_end_date
                  ? new Date(`${internship.expected_end_date}T12:00:00`).toLocaleDateString("pt-BR")
                  : "Não informada"}
              </p>
              <p className="mt-5 text-xs text-slate-400">ID {internship.id}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
