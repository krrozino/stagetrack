import type { InternshipStatus } from "@/features/internships";

export type DashboardInternshipSummary = {
  id: string;
  title: string;
  organizationName: string;
  completedMinutes: number;
  requiredMinutes: number;
  expectedEndDate: string | null;
  status: InternshipStatus;
};

export type DashboardActivitySummary = {
  id: string;
  date: string;
  description: string;
  durationMinutes: number;
  status: "draft" | "submitted" | "approved" | "rejected";
};

export type DashboardViewModel = {
  internship: DashboardInternshipSummary | null;
  activityCount: number;
  lastActivityAt: string | null;
  recentActivities: DashboardActivitySummary[];
};
