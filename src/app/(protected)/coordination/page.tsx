import Link from "next/link";
import { redirect } from "next/navigation";

import { InternshipAssignmentCard } from "@/features/coordination/components/internship-assignment-card";
import { getCoordinationWorkspace } from "@/features/coordination";

type CoordinationPageProps = {
  searchParams: Promise<{ updated?: string; error?: string }>;
};

export default async function CoordinationPage({
  searchParams,
}: CoordinationPageProps) {
  const params = await searchParams;
  const result = await getCoordinationWorkspace();

  if (!result.ok && result.error.code === "coordinator_role_required") {
    redirect("/advisor");
  }

  if (!result.ok) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8 dark:border-amber-900 dark:bg-amber-950/40">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          Coordenação
        </p>
        <h1 className="mt-2 text-2xl font-bold text-amber-950 dark:text-amber-50">
          Não foi possível carregar os vínculos agora.
        </h1>
      </section>
    );
  }

  const workspace = result.data;
  const assignedCount = workspace.internships.filter(
    (internship) => internship.advisorId,
  ).length;

  return (
    <div className="space-y-7 sm:space-y-9">
      {params.updated === "1" ? (
        <Notice tone="success">
          Orientador atualizado. A fila de revisão já reflete o novo vínculo.
        </Notice>
      ) : null}

      {params.error ? (
        <Notice tone="error">
          {params.error === "invalid"
            ? "Selecione um orientador válido ou deixe o estágio sem orientador."
            : "Não foi possível atualizar o vínculo. Tente novamente."}
        </Notice>
      ) : null}

      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Coordenação
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Atribuição de orientadores
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Vincule cada estágio a um orientador responsável. O vínculo controla quem pode visualizar e revisar as atividades daquele estudante.
          </p>
        </div>
        <Link
          href="/coordination/people"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-950"
        >
          Gerenciar pessoas
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric value={String(workspace.internships.length)} label="Estágios" />
        <Metric value={String(assignedCount)} label="Com orientador" />
        <Metric value={String(workspace.advisors.length)} label="Orientadores disponíveis" />
      </section>

      {workspace.advisors.length === 0 ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8 dark:border-amber-900 dark:bg-amber-950/40">
          <h2 className="text-lg font-bold text-amber-950 dark:text-amber-50">
            Ainda não existem perfis de orientador.
          </h2>
          <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-200">
            Promova uma conta já cadastrada em <Link href="/coordination/people" className="font-bold underline">Gerenciar pessoas</Link>. Depois ela aparecerá aqui para ser atribuída a um estágio.
          </p>
        </section>
      ) : null}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Estágios
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
              Responsáveis por acompanhamento
            </h2>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {workspace.internships.length} registro(s)
          </span>
        </div>

        {workspace.internships.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="font-semibold text-slate-900 dark:text-white">
              Nenhum estágio cadastrado ainda.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {workspace.internships.map((internship) => (
              <InternshipAssignmentCard
                key={internship.id}
                internship={internship}
                advisors={workspace.advisors}
              />
            ))}
          </div>
        )}
      </section>
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

function Notice({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: React.ReactNode;
}) {
  const classes =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
      : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200";

  return (
    <div className={`rounded-2xl border p-4 text-sm font-semibold ${classes}`}>
      {children}
    </div>
  );
}
