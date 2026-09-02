import Link from "next/link";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recuperar acesso"
      title="Esqueceu sua senha?"
      description="Informe seu e-mail e enviaremos as instruções disponíveis para recuperar o acesso."
      footer={
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Voltar para o login
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
