import type { Tables } from "@/types/database";

export type CoordinationError = {
  code: string;
  message: string;
};

export type CoordinationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: CoordinationError };

export type AdvisorCandidate = {
  id: string;
  fullName: string;
  role: "advisor" | "coordinator";
};

export type CoordinationInternship = {
  id: string;
  status: Tables<"internships">["status"];
  startDate: string;
  advisorId: string | null;
  advisorName: string | null;
  studentId: string;
  studentName: string;
  registrationNumber: string | null;
  internshipTypeName: string;
  organizationName: string;
};

export type CoordinationWorkspace = {
  coordinatorName: string;
  advisors: AdvisorCandidate[];
  internships: CoordinationInternship[];
};
