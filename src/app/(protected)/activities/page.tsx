export default function ActivitiesPage() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold text-indigo-600">Atividades</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        Registros de atividades
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        Esta área já exige uma sessão válida. O registro de data, horários,
        duração e descrição das atividades será conectado aqui nas próximas
        entregas.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["0h", "Horas registradas"],
          ["0", "Atividades"],
          ["—", "Último registro"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl bg-slate-50 p-5">
            <p className="text-2xl font-bold text-slate-950">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
