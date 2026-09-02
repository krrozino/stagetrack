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

export type ManageableProfile = {
  id: string;
  fullName: string;
  registrationNumber: string | null;
  role: "student" | "advisor";
  assignedInternshipCount: number;
  createdAt: string;
};

export type RoleChangeHistoryItem = {
  id: string;
  targetProfileId: string;
  targetName: string;
  actorName: string;
  previousRole: "student" | "advisor";
  requestedRole: "student" | "advisor";
  createdAt: string;
};

export type CoordinationPeopleWorkspace = {
  coordinatorName: string;
  profiles: ManageableProfile[];
  recentChanges: RoleChangeHistoryItem[];
};
