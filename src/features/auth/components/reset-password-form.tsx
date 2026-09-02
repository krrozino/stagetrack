"use client";

import { useActionState } from "react";

import { resetPasswordAction } from "../actions/auth.actions";
import { INITIAL_AUTH_ACTION_STATE } from "../types";
import { AuthField } from "./auth-field";
import { AuthMessage } from "./auth-message";
import { SubmitButton } from "./submit-button";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(
    resetPasswordAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthMessage state={state} />

      <AuthField
        id="reset-password"
        label="Nova senha"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo de 8 caracteres"
        error={state.fieldErrors?.password}
      />

      <AuthField
        id="reset-confirm-password"
        label="Confirmar nova senha"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Repita a nova senha"
        error={state.fieldErrors?.confirmPassword}
      />

      <SubmitButton idleLabel="Salvar nova senha" pendingLabel="Salvando..." />
    </form>
  );
}
