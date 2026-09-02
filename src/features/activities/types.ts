import type { Tables } from "@/types/database";

export type ActivityLog = Tables<"activity_logs"> & {
  review_comment: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type ActivityStatusEvent = {
  id: string;
  activity_id: string;
  internship_id: string;
  student_id: string;
  actor_id: string;
  from_status: ActivityLog["status"] | null;
  to_status: ActivityLog["status"];
  comment: string | null;
  created_at: string;
};

export type ActivityError = {
  code: string;
  message: string;
};

export type ActivityResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActivityError };

export type ActivitySummary = {
  totalMinutes: number;
  count: number;
  lastActivityAt: string | null;
  recent: ActivityLog[];
};
