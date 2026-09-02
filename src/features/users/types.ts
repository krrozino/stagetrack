import type { Enums, Tables } from "@/types/database";

export type UserRole = Enums<"app_role">;
export type Profile = Tables<"profiles">;

export type ProfileRepositoryError = {
  code: string;
  message: string;
};

export type ProfileResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ProfileRepositoryError };
