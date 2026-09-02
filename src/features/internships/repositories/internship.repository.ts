import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database";

import {
  createInternshipInputSchema,
  internshipIdSchema,
  updateInternshipInputSchema,
  type CreateInternshipInput,
  type UpdateInternshipInput,
} from "../schemas/internship.schema";
import type { Internship, InternshipResult } from "../types";

const INTERNSHIP_COLUMNS =
  "id,student_id,internship_type_id,organization_id,supervisor_id,advisor_id,start_date,expected_end_date,required_minutes,status,created_at,updated_at" as const;

function repositoryError(
  code: string,
  message: string,
): InternshipResult<never> {
  return { ok: false, error: { code, message } };
}

function databaseError(error: PostgrestError): InternshipResult<never> {
  return repositoryError(error.code, error.message);
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

export async function createInternship(
  input: CreateInternshipInput,
): Promise<InternshipResult<Internship>> {
  const parsed = createInternshipInputSchema.safeParse(input);

  if (!parsed.success) {
    return repositoryError(
      "invalid_internship_input",
      parsed.error.issues[0]?.message ?? "Invalid internship data.",
    );
  }

  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const clientPayload = {
    internship_type_id: parsed.data.internshipTypeId,
    organization_id: parsed.data.organizationId,
    supervisor_id: parsed.data.supervisorId ?? null,
    start_date: parsed.data.startDate,
    expected_end_date: parsed.data.expectedEndDate ?? null,
  };

  // `required_minutes` is NOT supplied by the client. PostgreSQL fills it in
  // through the protected BEFORE INSERT trigger, while generated Supabase types
  // cannot infer trigger-populated required columns.
  const insertPayload =
    clientPayload as unknown as TablesInsert<"internships">;

  const { data, error } = await auth.supabase
    .from("internships")
    .insert(insertPayload)
    .select(INTERNSHIP_COLUMNS)
    .single();

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function getInternship(
  internshipId: string,
): Promise<InternshipResult<Internship | null>> {
  const parsedId = internshipIdSchema.safeParse(internshipId);

  if (!parsedId.success) {
    return repositoryError("invalid_internship_id", "Invalid internship ID.");
  }

  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("internships")
    .select(INTERNSHIP_COLUMNS)
    .eq("id", parsedId.data)
    .eq("student_id", auth.userId)
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function listStudentInternships(): Promise<
  InternshipResult<Internship[]>
> {
  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("internships")
    .select(INTERNSHIP_COLUMNS)
    .eq("student_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function getCurrentInternship(): Promise<
  InternshipResult<Internship | null>
> {
  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("internships")
    .select(INTERNSHIP_COLUMNS)
    .eq("student_id", auth.userId)
    .in("status", ["active", "paused", "draft"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function updateInternship(
  internshipId: string,
  input: UpdateInternshipInput,
): Promise<InternshipResult<Internship>> {
  const parsedId = internshipIdSchema.safeParse(internshipId);
  const parsed = updateInternshipInputSchema.safeParse(input);

  if (!parsedId.success) {
    return repositoryError("invalid_internship_id", "Invalid internship ID.");
  }

  if (!parsed.success) {
    return repositoryError(
      "invalid_internship_update",
      parsed.error.issues[0]?.message ?? "Invalid internship update.",
    );
  }

  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const updatePayload: TablesUpdate<"internships"> = {};

  if (parsed.data.internshipTypeId !== undefined) {
    updatePayload.internship_type_id = parsed.data.internshipTypeId;
  }

  if (parsed.data.organizationId !== undefined) {
    updatePayload.organization_id = parsed.data.organizationId;
  }

  if (parsed.data.supervisorId !== undefined) {
    updatePayload.supervisor_id = parsed.data.supervisorId;
  }

  if (parsed.data.startDate !== undefined) {
    updatePayload.start_date = parsed.data.startDate;
  }

  if (parsed.data.expectedEndDate !== undefined) {
    updatePayload.expected_end_date = parsed.data.expectedEndDate;
  }

  if (parsed.data.status !== undefined) {
    updatePayload.status = parsed.data.status;
  }

  const { data, error } = await auth.supabase
    .from("internships")
    .update(updatePayload)
    .eq("id", parsedId.data)
    .eq("student_id", auth.userId)
    .select(INTERNSHIP_COLUMNS)
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  if (!data) {
    return repositoryError(
      "internship_not_found_or_not_editable",
      "Internship was not found or cannot be edited by the current user.",
    );
  }

  return { ok: true, data };
}
