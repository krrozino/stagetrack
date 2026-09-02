import Link from "next/link";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Primeiro acesso"
      title="Crie sua conta"
      description="Comece pelo básico. Depois você poderá cadastrar e acompanhar seu estágio."
      footer={
        <p>
          Já possui uma conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
