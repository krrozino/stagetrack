import Link from "next/link";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

const notices: Record<string, string> = {
  "email-confirmed": "E-mail confirmado. Agora você já pode acessar sua conta.",
  "password-updated": "Senha atualizada com sucesso. Entre usando a nova senha.",
};

type LoginPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return (
    <AuthShell
      eyebrow="Acessar conta"
      title="Bem-vindo de volta"
      description="Entre para continuar acompanhando sua jornada de estágio."
      footer={
        <p>
          Ainda não tem uma conta?{" "}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Criar conta
          </Link>
        </p>
      }
    >
      <LoginForm notice={message ? notices[message] : undefined} />
    </AuthShell>
  );
}
