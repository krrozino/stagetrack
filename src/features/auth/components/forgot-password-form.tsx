"use client";

import { useActionState } from "react";

import { forgotPasswordAction } from "../actions/auth.actions";
import { INITIAL_AUTH_ACTION_STATE } from "../types";
import { AuthField } from "./auth-field";
import { AuthMessage } from "./auth-message";
import { SubmitButton } from "./submit-button";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthMessage state={state} />

      <AuthField
        id="forgot-email"
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@exemplo.com"
        error={state.fieldErrors?.email}
      />

      <SubmitButton
        idleLabel="Enviar instruções"
        pendingLabel="Enviando..."
      />
    </form>
  );
}
