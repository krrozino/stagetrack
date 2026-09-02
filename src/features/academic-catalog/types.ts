import type { Tables } from "@/types/database";

export type AcademicInstitution = Tables<"academic_institutions">;
export type Course = Tables<"courses">;
export type InternshipType = Tables<"internship_types">;

export type CatalogRepositoryError = {
  code: string;
  message: string;
};

export type CatalogResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: CatalogRepositoryError };
