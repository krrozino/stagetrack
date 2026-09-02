import type { Tables } from "@/types/database";

type SupervisorRow = Tables<"supervisors">;

export type Supervisor = Omit<SupervisorRow, "created_by">;

export type SupervisorRepositoryError = {
  code: string;
  message: string;
};

export type SupervisorResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: SupervisorRepositoryError };
