import type { ActivityLog, ActivityStatusEvent } from "@/features/activities";

export type ReviewerRole = "advisor" | "coordinator";

export type AssignedInternshipSummary = {
  id: string;
  studentId: string;
  studentName: string;
  registrationNumber: string | null;
  internshipTypeName: string;
  organizationName: string;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
};

export type ReviewQueueItem = ActivityLog & {
  internship: AssignedInternshipSummary;
};

export type AdvisorWorkspace = {
  reviewerName: string;
  role: ReviewerRole;
  internships: AssignedInternshipSummary[];
  pending: ReviewQueueItem[];
  reviewed: ReviewQueueItem[];
  events: ActivityStatusEvent[];
};

export type AdvisorError = {
  code: string;
  message: string;
};

export type AdvisorResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AdvisorError };
