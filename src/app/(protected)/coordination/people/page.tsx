import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileRoleCard } from "@/features/coordination/components/profile-role-card";
import { getCoordinationPeopleWorkspace } from "@/features/coordination";

type CoordinationPeoplePageProps = {
  searchParams: Promise<{ updated?: string; error?: string }>;
};

const ROLE_LABELS = {
  student: "Estudante",
  advisor: "Orientador",
} as const;

function dateTimeLabel(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function CoordinationPeoplePage({
  searchParams,
}: CoordinationPeoplePageProps) {
  const params = await searchParams;
  const result = await getCoordinationPeopleWorkspace();

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
          Não foi possível carregar os perfis agora.
        </h1>
      </section>
    );
  }

  const workspace = result.data;
  const students = workspace.profiles.filter((profile) => profile.role === "student");
  const advisors = workspace.profiles.filter((profile) => profile.role === "advisor");

  return (
    <div className="space-y-7 sm:space-y-9">
      <div>
        <Link
          href="/coordination"
          className="inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Voltar para atribuições
        </Link>
      </div>

      {params.updated === "advisor" ? (
        <Notice tone="success">
          Perfil promovido a orientador. Ele já pode ser atribuído a um estágio.
        </Notice>
      ) : null}
      {params.updated === "student" ? (
        <Notice tone="success">
          Papel de orientador removido e perfil devolvido para estudante.
        </Notice>
      ) : null}
      {params.error ? (
        <Notice tone="error">
          {params.error === "assigned"
            ? "Este orientador ainda possui estágio atribuído. Remova o vínculo antes de alterar o papel."
            : params.error === "invalid"
              ? "Este perfil não pode ter o papel alterado por este fluxo."
              : "Não foi possível alterar o papel agora. Tente novamente."}
        </Notice>
      ) : null}

      <section>
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          Coordenação · Pessoas
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          Papéis acadêmicos
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Transforme contas já cadastradas em orientadores. O papel de coordenador não pode ser concedido por esta tela e cada mudança fica registrada no histórico.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric value={String(workspace.profiles.length)} label="Perfis gerenciáveis" />
        <Metric value={String(students.length)} label="Estudantes" />
        <Metric value={String(advisors.length)} label="Orientadores" />
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Perfis
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
              Estudantes e orientadores
            </h2>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {workspace.profiles.length} conta(s)
          </span>
        </div>

        {workspace.profiles.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="font-semibold text-slate-900 dark:text-white">
              Nenhuma outra conta cadastrada ainda.
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Quando outra pessoa criar uma conta no StageTrack, ela aparecerá aqui como estudante por padrão.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {workspace.profiles.map((profile) => (
              <ProfileRoleCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Auditoria
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            Mudanças recentes de papel
          </h2>
        </div>

        {workspace.recentChanges.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-7 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nenhuma mudança de papel registrada ainda.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {workspace.recentChanges.map((change, index) => (
              <div
                key={change.id}
                className={`flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between ${
                  index > 0 ? "border-t border-slate-100 dark:border-slate-800" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">
                    {change.targetName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {ROLE_LABELS[change.previousRole]} → {ROLE_LABELS[change.requestedRole]} · por {change.actorName}
                  </p>
                </div>
                <time className="text-xs font-medium text-slate-400">
                  {dateTimeLabel(change.createdAt)}
                </time>
              </div>
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
