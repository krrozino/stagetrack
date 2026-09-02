import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

import {
  supervisorIdSchema,
  supervisorInputSchema,
  type SupervisorInput,
} from "../schemas/supervisor.schema";
import type { Supervisor, SupervisorResult } from "../types";

const SUPERVISOR_COLUMNS =
  "id,organization_id,name,email,phone,position,created_at,updated_at" as const;

function repositoryError(
  code: string,
  message: string,
): SupervisorResult<never> {
  return { ok: false, error: { code, message } };
}

function databaseError(error: PostgrestError): SupervisorResult<never> {
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

function parseInput(input: SupervisorInput) {
  const parsed = supervisorInputSchema.safeParse(input);

  if (!parsed.success) {
    return repositoryError(
      "invalid_supervisor_input",
      parsed.error.issues[0]?.message ?? "Invalid supervisor data.",
    );
  }

  return { ok: true as const, data: parsed.data };
}

function supervisorPayload(input: SupervisorInput) {
  return {
    organization_id: input.organizationId,
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    position: input.position ?? null,
  };
}

export async function listStudentSupervisors(): Promise<
  SupervisorResult<Supervisor[]>
> {
  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("supervisors")
    .select(SUPERVISOR_COLUMNS)
    .order("name", { ascending: true });

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function listSupervisorsForOrganization(
  organizationId: string,
): Promise<SupervisorResult<Supervisor[]>> {
  const parsedId = supervisorInputSchema.shape.organizationId.safeParse(
    organizationId,
  );

  if (!parsedId.success) {
    return repositoryError("invalid_organization_id", "Invalid organization ID.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supervisors")
    .select(SUPERVISOR_COLUMNS)
    .eq("organization_id", parsedId.data)
    .order("name", { ascending: true });

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function createSupervisor(
  input: SupervisorInput,
): Promise<SupervisorResult<Supervisor>> {
  const parsed = parseInput(input);

  if (!parsed.ok) {
    return parsed;
  }

  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("supervisors")
    .insert({
      created_by: auth.userId,
      ...supervisorPayload(parsed.data),
    })
    .select(SUPERVISOR_COLUMNS)
    .single();

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function updateSupervisor(
  supervisorId: string,
  input: SupervisorInput,
): Promise<SupervisorResult<Supervisor>> {
  const parsedId = supervisorIdSchema.safeParse(supervisorId);
  const parsed = parseInput(input);

  if (!parsedId.success) {
    return repositoryError("invalid_supervisor_id", "Invalid supervisor ID.");
  }

  if (!parsed.ok) {
    return parsed;
  }

  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("supervisors")
    .update(supervisorPayload(parsed.data))
    .eq("id", parsedId.data)
    .select(SUPERVISOR_COLUMNS)
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  if (!data) {
    return repositoryError(
      "supervisor_not_found_or_not_owned",
      "Supervisor was not found or cannot be edited by the current user.",
    );
  }

  return { ok: true, data };
}
