"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "../actions/auth.actions";
import { INITIAL_AUTH_ACTION_STATE } from "../types";
import { AuthField } from "./auth-field";
import { AuthMessage } from "./auth-message";
import { SubmitButton } from "./submit-button";

type LoginFormProps = {
  notice?: string;
};

export function LoginForm({ notice }: LoginFormProps) {
  const [state, formAction] = useActionState(
    loginAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AuthMessage state={state} notice={notice} />

      <AuthField
        id="login-email"
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@exemplo.com"
        error={state.fieldErrors?.email}
      />

      <div>
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-slate-800"
          >
            Senha
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Esqueci minha senha
          </Link>
        </div>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "login-password-error" : undefined
          }
          className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 aria-[invalid=true]:border-rose-400"
        />
        {state.fieldErrors?.password ? (
          <p id="login-password-error" className="mt-2 text-sm text-rose-600">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      <SubmitButton idleLabel="Entrar" pendingLabel="Entrando..." />
    </form>
  );
}
