"use server";

import type { ZodError } from "zod";
import { redirect } from "next/navigation";

import {
  createCurrentProfile,
  getCurrentProfile,
} from "@/features/users";

import {
  login,
  logout,
  register,
  requestPasswordReset,
  updatePassword,
} from "../services/auth.service";
import {
  forgotPasswordFormSchema,
  loginFormSchema,
  registerFormSchema,
  resetPasswordFormSchema,
} from "../schemas/auth.schema";
import type {
  AuthActionState,
  AuthFormField,
} from "../types";

function formValues(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function fieldErrors(error: ZodError): AuthActionState["fieldErrors"] {
  const errors: Partial<Record<AuthFormField, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && !(field in errors)) {
      errors[field as AuthFormField] = issue.message;
    }
  }

  return errors;
}

function validationError(error: ZodError): AuthActionState {
  return {
    status: "error",
    message: "Revise os campos destacados.",
    fieldErrors: fieldErrors(error),
  };
}

function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return new URL(configuredUrl).origin;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  throw new Error("Missing NEXT_PUBLIC_SITE_URL for authentication redirects.");
}

function authCallbackUrl(next: string) {
  const callback = new URL("/auth/callback", getSiteUrl());
  callback.searchParams.set("next", next);
  return callback.toString();
}

async function ensureProfileAfterLogin(
  fullNameFromMetadata: unknown,
): Promise<AuthActionState | null> {
  const existing = await getCurrentProfile();

  if (!existing.ok) {
    await logout();
    return {
      status: "error",
      message: "Não foi possível carregar seu perfil. Tente novamente.",
    };
  }

  if (existing.data) {
    return null;
  }

  const fullName =
    typeof fullNameFromMetadata === "string" &&
    fullNameFromMetadata.trim().length >= 2
      ? fullNameFromMetadata.trim()
      : "Usuário StageTrack";

  const created = await createCurrentProfile({ fullName });

  if (!created.ok) {
    await logout();
    return {
      status: "error",
      message: "Sua conta foi acessada, mas o perfil não pôde ser preparado.",
    };
  }

  return null;
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginFormSchema.safeParse(formValues(formData));

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const result = await login(parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message: "E-mail ou senha inválidos.",
    };
  }

  const profileError = await ensureProfileAfterLogin(
    result.data.user.user_metadata.full_name,
  );

  if (profileError) {
    return profileError;
  }

  redirect("/dashboard");
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerFormSchema.safeParse(formValues(formData));

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const result = await register({
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    password: parsed.data.password,
    emailRedirectTo: authCallbackUrl("/login?message=email-confirmed"),
  });

  if (!result.ok) {
    return {
      status: "error",
      message:
        "Não foi possível criar a conta. Se já possui cadastro, tente entrar.",
    };
  }

  if (result.data.requiresEmailConfirmation) {
    return {
      status: "success",
      message:
        "Conta criada. Confira seu e-mail para confirmar o cadastro antes de entrar.",
    };
  }

  const profile = await createCurrentProfile({
    fullName: parsed.data.fullName,
  });

  if (!profile.ok && profile.error.code !== "23505") {
    await logout();
    return {
      status: "error",
      message: "Conta criada, mas não foi possível preparar seu perfil.",
    };
  }

  redirect("/dashboard");
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordFormSchema.safeParse(formValues(formData));

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const result = await requestPasswordReset({
    email: parsed.data.email,
    redirectTo: authCallbackUrl("/reset-password"),
  });

  if (!result.ok) {
    return {
      status: "error",
      message: "Não foi possível enviar o e-mail agora. Tente novamente.",
    };
  }

  return {
    status: "success",
    message:
      "Se existir uma conta com esse e-mail, você receberá as instruções para redefinir a senha.",
  };
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordFormSchema.safeParse(formValues(formData));

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const result = await updatePassword(parsed.data.password);

  if (!result.ok) {
    return {
      status: "error",
      message:
        "Não foi possível alterar a senha. Solicite um novo link de recuperação.",
    };
  }

  redirect("/login?message=password-updated");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
