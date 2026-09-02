import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

import type { InternshipResult } from "../types";
import type { InternshipOverview } from "../types.overview";

const INTERNSHIP_OVERVIEW_COLUMNS = `
  id,
  student_id,
  internship_type_id,
  organization_id,
  supervisor_id,
  advisor_id,
  start_date,
  expected_end_date,
  required_minutes,
  status,
  created_at,
  updated_at,
  internship_types!internships_internship_type_id_fkey (
    name,
    description,
    course_id
  ),
  organizations!internships_organization_id_fkey (
    name,
    city,
    state
  ),
  supervisors!internships_supervisor_organization_fkey (
    name,
    position
  )
` as const;

function databaseError(error: PostgrestError): InternshipResult<never> {
  return {
    ok: false,
    error: {
      code: error.code,
      message: error.message,
    },
  };
}

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    return {
      ok: false as const,
      error: {
        code: error?.code ?? "not_authenticated",
        message: error?.message ?? "Authenticated user is required.",
      },
    };
  }

  return { ok: true as const, supabase, userId };
}

export async function getCurrentInternshipOverview(): Promise<
  InternshipResult<InternshipOverview | null>
> {
  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("internships")
    .select(INTERNSHIP_OVERVIEW_COLUMNS)
    .eq("student_id", auth.userId)
    .in("status", ["active", "paused", "draft"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data: data as InternshipOverview | null };
}

export async function listStudentInternshipOverviews(): Promise<
  InternshipResult<InternshipOverview[]>
> {
  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("internships")
    .select(INTERNSHIP_OVERVIEW_COLUMNS)
    .eq("student_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data: data as InternshipOverview[] };
}
