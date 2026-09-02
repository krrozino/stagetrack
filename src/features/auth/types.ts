import type { User } from "@supabase/supabase-js";

export type AuthErrorInfo = {
  code: string | null;
  message: string;
  status: number | null;
};

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AuthErrorInfo };

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegisterInput = AuthCredentials & {
  fullName?: string;
  emailRedirectTo?: string;
};

export type RegisterResult = {
  user: User | null;
  requiresEmailConfirmation: boolean;
};

export type LoginResult = {
  user: User;
};

export type PasswordResetInput = {
  email: string;
  redirectTo?: string;
};

export type AuthFormField =
  | "fullName"
  | "email"
  | "password"
  | "confirmPassword";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<AuthFormField, string>>;
};

export const INITIAL_AUTH_ACTION_STATE: AuthActionState = {
  status: "idle",
};
