export default function InternshipsPage() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold text-indigo-600">Estágios</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        Seus estágios supervisionados
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        A rota já está protegida e pronta para receber o cadastro e o
        acompanhamento dos estágios nas próximas etapas do projeto.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
        <p className="text-sm font-semibold text-slate-800">Nenhum estágio cadastrado ainda.</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          O fluxo de criação do primeiro estágio será implementado no próximo
          bloco funcional do StageTrack.
        </p>
      </div>
    </section>
  );
}
