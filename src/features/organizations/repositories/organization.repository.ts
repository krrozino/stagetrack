import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

import {
  organizationIdSchema,
  organizationInputSchema,
  type OrganizationInput,
} from "../schemas/organization.schema";
import type { Organization, OrganizationResult } from "../types";

const ORGANIZATION_COLUMNS =
  "id,name,document,email,phone,address,city,state,postal_code,created_at,updated_at" as const;

function repositoryError(
  code: string,
  message: string,
): OrganizationResult<never> {
  return { ok: false, error: { code, message } };
}

function databaseError(error: PostgrestError): OrganizationResult<never> {
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

function parseInput(input: OrganizationInput) {
  const parsed = organizationInputSchema.safeParse(input);

  if (!parsed.success) {
    return repositoryError(
      "invalid_organization_input",
      parsed.error.issues[0]?.message ?? "Invalid organization data.",
    );
  }

  return { ok: true as const, data: parsed.data };
}

function organizationPayload(input: OrganizationInput) {
  return {
    name: input.name,
    document: input.document ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    address: input.address ?? null,
    city: input.city ?? null,
    state: input.state ?? null,
    postal_code: input.postalCode ?? null,
  };
}

export async function listOrganizations(): Promise<
  OrganizationResult<Organization[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(ORGANIZATION_COLUMNS)
    .order("name", { ascending: true });

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function getOrganization(
  organizationId: string,
): Promise<OrganizationResult<Organization | null>> {
  const parsedId = organizationIdSchema.safeParse(organizationId);

  if (!parsedId.success) {
    return repositoryError("invalid_organization_id", "Invalid organization ID.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(ORGANIZATION_COLUMNS)
    .eq("id", parsedId.data)
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function createOrganization(
  input: OrganizationInput,
): Promise<OrganizationResult<Organization>> {
  const parsed = parseInput(input);

  if (!parsed.ok) {
    return parsed;
  }

  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("organizations")
    .insert({
      created_by: auth.userId,
      ...organizationPayload(parsed.data),
    })
    .select(ORGANIZATION_COLUMNS)
    .single();

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function updateOrganization(
  organizationId: string,
  input: OrganizationInput,
): Promise<OrganizationResult<Organization>> {
  const parsedId = organizationIdSchema.safeParse(organizationId);
  const parsed = parseInput(input);

  if (!parsedId.success) {
    return repositoryError("invalid_organization_id", "Invalid organization ID.");
  }

  if (!parsed.ok) {
    return parsed;
  }

  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("organizations")
    .update(organizationPayload(parsed.data))
    .eq("id", parsedId.data)
    .select(ORGANIZATION_COLUMNS)
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  if (!data) {
    return repositoryError(
      "organization_not_found_or_not_owned",
      "Organization was not found or cannot be edited by the current user.",
    );
  }

  return { ok: true, data };
}
