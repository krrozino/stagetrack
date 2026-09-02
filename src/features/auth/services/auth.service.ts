import type { AuthError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

import type {
  AuthCredentials,
  AuthErrorInfo,
  AuthResult,
  LoginResult,
  PasswordResetInput,
  RegisterInput,
  RegisterResult,
} from "../types";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeAuthError(error: AuthError): AuthErrorInfo {
  return {
    code: error.code ?? null,
    message: error.message,
    status: error.status ?? null,
  };
}

function unexpectedAuthError(message: string): AuthResult<never> {
  return {
    ok: false,
    error: {
      code: "unexpected_auth_state",
      message,
      status: null,
    },
  };
}

export async function register(
  input: RegisterInput,
): Promise<AuthResult<RegisterResult>> {
  const supabase = await createClient();
  const fullName = input.fullName?.trim();

  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(input.email),
    password: input.password,
    options: {
      ...(fullName ? { data: { full_name: fullName } } : {}),
      ...(input.emailRedirectTo
        ? { emailRedirectTo: input.emailRedirectTo }
        : {}),
    },
  });

  if (error) {
    return { ok: false, error: normalizeAuthError(error) };
  }

  return {
    ok: true,
    data: {
      user: data.user,
      requiresEmailConfirmation: !data.session,
    },
  };
}

export async function login(
  credentials: AuthCredentials,
): Promise<AuthResult<LoginResult>> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(credentials.email),
    password: credentials.password,
  });

  if (error) {
    return { ok: false, error: normalizeAuthError(error) };
  }

  if (!data.user) {
    return unexpectedAuthError("Authentication succeeded without a user.");
  }

  return { ok: true, data: { user: data.user } };
}

export async function logout(): Promise<AuthResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { ok: false, error: normalizeAuthError(error) };
  }

  return { ok: true, data: null };
}

export async function requestPasswordReset(
  input: PasswordResetInput,
): Promise<AuthResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    normalizeEmail(input.email),
    input.redirectTo ? { redirectTo: input.redirectTo } : undefined,
  );

  if (error) {
    return { ok: false, error: normalizeAuthError(error) };
  }

  return { ok: true, data: null };
}

export async function updatePassword(
  password: string,
): Promise<AuthResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { ok: false, error: normalizeAuthError(error) };
  }

  return { ok: true, data: null };
}
