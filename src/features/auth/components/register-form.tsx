"use client";

import { useActionState } from "react";

import { registerAction } from "../actions/auth.actions";
import { INITIAL_AUTH_ACTION_STATE } from "../types";
import { AuthField } from "./auth-field";
import { AuthMessage } from "./auth-message";
import { SubmitButton } from "./submit-button";

export function RegisterForm() {
  const [state, formAction] = useActionState(
    registerAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthMessage state={state} />

      <AuthField
        id="register-full-name"
        label="Nome completo"
        name="fullName"
        autoComplete="name"
        placeholder="Seu nome completo"
        error={state.fieldErrors?.fullName}
      />

      <AuthField
        id="register-email"
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@exemplo.com"
        error={state.fieldErrors?.email}
      />

      <AuthField
        id="register-password"
        label="Senha"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo de 8 caracteres"
        error={state.fieldErrors?.password}
      />

      <AuthField
        id="register-confirm-password"
        label="Confirmar senha"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Repita sua senha"
        error={state.fieldErrors?.confirmPassword}
      />

      <SubmitButton
        idleLabel="Criar minha conta"
        pendingLabel="Criando conta..."
      />
    </form>
  );
}
