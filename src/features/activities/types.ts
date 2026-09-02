import type { Tables } from "@/types/database";

export type ActivityLog = Tables<"activity_logs">;

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
