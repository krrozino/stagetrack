import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(circle at 15% 15%, rgba(99,102,241,.38), transparent 36%), radial-gradient(circle at 85% 82%, rgba(37,99,235,.3), transparent 40%)",
            }}
          />

          <div className="relative">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-white"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-white text-base font-black text-slate-950">
                ST
              </span>
              StageTrack
            </Link>
          </div>

          <div className="relative max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">
              Jornada acadêmica organizada
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight">
              Menos planilhas. Mais clareza sobre o seu estágio.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
              Registre atividades, acompanhe sua carga horária e mantenha as
              informações do estágio em um único lugar.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3 text-xs text-slate-300">
            {[
              ["01", "Registre"],
              ["02", "Acompanhe"],
              ["03", "Conclua"],
            ].map(([number, label]) => (
              <div
                key={number}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <span className="font-mono text-indigo-300">{number}</span>
                <p className="mt-2 font-medium text-white">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-3 font-semibold text-slate-950 lg:hidden"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
                ST
              </span>
              StageTrack
            </Link>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {description}
            </p>

            <div className="mt-8">{children}</div>

            {footer ? (
              <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
                {footer}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
