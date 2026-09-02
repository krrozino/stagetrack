import type { Tables } from "@/types/database";

import type { Internship } from "./types";

export type InternshipTypeSummary = Pick<
  Tables<"internship_types">,
  "name" | "description" | "course_id"
>;

export type OrganizationSummary = Pick<
  Tables<"organizations">,
  "name" | "city" | "state"
>;

export type SupervisorSummary = Pick<
  Tables<"supervisors">,
  "name" | "position"
>;

export type InternshipOverview = Internship & {
  internship_types: InternshipTypeSummary;
  organizations: OrganizationSummary;
  supervisors: SupervisorSummary | null;
};
