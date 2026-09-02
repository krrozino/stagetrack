import Link from "next/link";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const hasSession = !error && Boolean(data?.claims?.sub);

  return (
    <AuthShell
      eyebrow="Nova senha"
      title={hasSession ? "Defina uma nova senha" : "Link de recuperação inválido"}
      description={
        hasSession
          ? "Escolha uma senha nova para concluir a recuperação da sua conta."
          : "O link pode ter expirado ou já ter sido utilizado. Solicite uma nova recuperação."
      }
      footer={
        <Link
          href={hasSession ? "/login" : "/forgot-password"}
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          {hasSession ? "Voltar para o login" : "Solicitar novo link"}
        </Link>
      }
    >
      {hasSession ? (
        <ResetPasswordForm />
      ) : (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
        >
          Não encontramos uma sessão de recuperação válida neste navegador.
        </div>
      )}
    </AuthShell>
  );
}
