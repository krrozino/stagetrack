import type { Tables } from "@/types/database";

type OrganizationRow = Tables<"organizations">;

export type Organization = Omit<OrganizationRow, "created_by">;

export type OrganizationRepositoryError = {
  code: string;
  message: string;
};

export type OrganizationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: OrganizationRepositoryError };
