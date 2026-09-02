import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            StageTrack · Em desenvolvimento
          </span>
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-slate-950"
          >
            Já tenho uma conta
          </Link>
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
          Seu estágio, organizado do início ao fim.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Acompanhe atividades, carga horária, progresso e documentação do
          estágio supervisionado em um único lugar.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Criar minha conta
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Entrar no StageTrack
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Horas", "Acompanhe o progresso sem cálculos manuais."],
            ["Atividades", "Mantenha um histórico organizado do estágio."],
            ["Documentos", "Centralize as pendências acadêmicas."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
