import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

import { catalogIdSchema } from "../schemas/catalog.schema";
import type {
  AcademicInstitution,
  CatalogResult,
  Course,
  InternshipType,
} from "../types";

const ACADEMIC_INSTITUTION_COLUMNS =
  "id,name,acronym,active,created_at,updated_at" as const;
const COURSE_COLUMNS =
  "id,academic_institution_id,name,code,active,created_at,updated_at" as const;
const INTERNSHIP_TYPE_COLUMNS =
  "id,course_id,name,description,required_minutes,active,created_at,updated_at" as const;

function databaseError(error: PostgrestError): CatalogResult<never> {
  return {
    ok: false,
    error: {
      code: error.code,
      message: error.message,
    },
  };
}

function invalidIdError(): CatalogResult<never> {
  return {
    ok: false,
    error: {
      code: "invalid_catalog_id",
      message: "A valid catalog UUID is required.",
    },
  };
}

export async function listActiveAcademicInstitutions(): Promise<
  CatalogResult<AcademicInstitution[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("academic_institutions")
    .select(ACADEMIC_INSTITUTION_COLUMNS)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function listActiveCourses(
  academicInstitutionId: string,
): Promise<CatalogResult<Course[]>> {
  const parsedId = catalogIdSchema.safeParse(academicInstitutionId);

  if (!parsedId.success) {
    return invalidIdError();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("academic_institution_id", parsedId.data)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function listActiveInternshipTypes(
  courseId: string,
): Promise<CatalogResult<InternshipType[]>> {
  const parsedId = catalogIdSchema.safeParse(courseId);

  if (!parsedId.success) {
    return invalidIdError();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internship_types")
    .select(INTERNSHIP_TYPE_COLUMNS)
    .eq("course_id", parsedId.data)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}
