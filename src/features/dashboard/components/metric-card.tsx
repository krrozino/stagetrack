type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  accent: "indigo" | "emerald" | "amber" | "slate";
};

const accentClasses = {
  indigo: "bg-indigo-500 ring-indigo-100",
  emerald: "bg-emerald-500 ring-emerald-100",
  amber: "bg-amber-500 ring-amber-100",
  slate: "bg-slate-500 ring-slate-200",
} as const;

export function MetricCard({ label, value, helper, accent }: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {value}
          </p>
        </div>

        <span
          className={`mt-0.5 h-3 w-3 rounded-full ring-4 ${accentClasses[accent]}`}
          aria-hidden="true"
        />
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-400">{helper}</p>
    </article>
  );
}
