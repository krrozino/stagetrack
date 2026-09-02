export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          StageTrack
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-950">
          Não foi possível concluir a autenticação
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          O link pode ter expirado ou já ter sido utilizado. Tente iniciar o
          acesso novamente.
        </p>
      </section>
    </main>
  );
}
