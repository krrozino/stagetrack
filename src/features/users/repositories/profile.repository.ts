import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

import {
  profileInputSchema,
  type ProfileInput,
} from "../schemas/profile.schema";
import type { Profile, ProfileResult } from "../types";

const PROFILE_COLUMNS =
  "id,full_name,role,registration_number,course_id,created_at,updated_at" as const;

function repositoryError(
  code: string,
  message: string,
): ProfileResult<never> {
  return { ok: false, error: { code, message } };
}

function databaseError(error: PostgrestError): ProfileResult<never> {
  return repositoryError(error.code, error.message);
}

async function getAuthenticatedUserId() {
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

function parseProfileInput(input: ProfileInput) {
  const parsed = profileInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: {
        code: "invalid_profile_input",
        message: parsed.error.issues[0]?.message ?? "Invalid profile data.",
      },
    };
  }

  return { ok: true as const, data: parsed.data };
}

export async function getCurrentProfile(): Promise<
  ProfileResult<Profile | null>
> {
  const auth = await getAuthenticatedUserId();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", auth.userId)
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function createCurrentProfile(
  input: ProfileInput,
): Promise<ProfileResult<Profile>> {
  const parsed = parseProfileInput(input);

  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const auth = await getAuthenticatedUserId();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("profiles")
    .insert({
      id: auth.userId,
      full_name: parsed.data.fullName,
      registration_number: parsed.data.registrationNumber ?? null,
    })
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function updateCurrentProfile(
  input: ProfileInput,
): Promise<ProfileResult<Profile>> {
  const parsed = parseProfileInput(input);

  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const auth = await getAuthenticatedUserId();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      registration_number: parsed.data.registrationNumber ?? null,
    })
    .eq("id", auth.userId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}
