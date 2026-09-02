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

export async function listStudentInternshipOverviews(): Promise<
  InternshipResult<InternshipOverview[]>
> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return {
      ok: false,
      error: {
        code: claimsError?.code ?? "not_authenticated",
        message: claimsError?.message ?? "Authenticated user is required.",
      },
    };
  }

  const { data, error } = await supabase
    .from("internships")
    .select(INTERNSHIP_OVERVIEW_COLUMNS)
    .eq("student_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data: data as InternshipOverview[] };
}
