import Link from "next/link";

const cards = [
  {
    href: "/internships",
    title: "Estágios",
    description: "Cadastre e acompanhe seus estágios supervisionados.",
  },
  {
    href: "/activities",
    title: "Atividades",
    description: "Registre atividades e acompanhe a evolução da carga horária.",
  },
  {
    href: "/profile",
    title: "Perfil",
    description: "Confira seus dados acadêmicos e informações da conta.",
  },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold text-indigo-600">Área autenticada</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Visão geral
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Este é o ponto de entrada da sua jornada de estágio no StageTrack.
          Os próximos módulos vão transformar estes atalhos em acompanhamento
          completo de estágio, horas e atividades.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <h2 className="text-lg font-bold text-slate-950">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {card.description}
            </p>
            <span className="mt-6 inline-flex text-sm font-semibold text-indigo-600">
              Acessar →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
