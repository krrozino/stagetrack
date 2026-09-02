import type { Enums, Tables } from "@/types/database";

export type Internship = Tables<"internships">;
export type InternshipStatus = Enums<"internship_status">;

export type InternshipRepositoryError = {
  code: string;
  message: string;
};

export type InternshipResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: InternshipRepositoryError };
