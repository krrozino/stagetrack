import { getCurrentProfile } from "@/features/users";

function roleLabel(role: "student" | "advisor" | "coordinator") {
  switch (role) {
    case "advisor":
      return "Orientador";
    case "coordinator":
      return "Coordenador";
    default:
      return "Estudante";
  }
}

export default async function ProfilePage() {
  const result = await getCurrentProfile();

  if (!result.ok || !result.data) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <p className="text-sm font-semibold text-amber-800">Perfil indisponível</p>
        <h1 className="mt-2 text-2xl font-bold text-amber-950">
          Não foi possível carregar seus dados agora.
        </h1>
        <p className="mt-3 text-sm leading-6 text-amber-800">
          Sua sessão continua protegida. Tente novamente ao atualizar a página.
        </p>
      </section>
    );
  }

  const profile = result.data;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-indigo-600">Perfil</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Seus dados no StageTrack
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Estas informações vêm do perfil protegido por RLS vinculado à sua
          conta do Supabase Auth.
        </p>
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Nome completo
          </p>
          <p className="mt-2 font-semibold text-slate-950">{profile.full_name}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Papel
          </p>
          <p className="mt-2 font-semibold text-slate-950">
            {roleLabel(profile.role)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5 sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Matrícula
          </p>
          <p className="mt-2 font-semibold text-slate-950">
            {profile.registration_number ?? "Ainda não informada"}
          </p>
        </div>
      </section>
    </div>
  );
}
