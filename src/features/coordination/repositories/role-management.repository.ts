import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database";

import {
  advisorRoleChangeInputSchema,
  type AdvisorRoleChangeInput,
} from "../schemas/advisor-role.schema";
import type {
  CoordinationPeopleWorkspace,
  CoordinationResult,
  ManageableProfile,
  RoleChangeHistoryItem,
} from "../types";

function repositoryError(code: string, message: string): CoordinationResult<never> {
  return { ok: false, error: { code, message } };
}

function databaseError(error: PostgrestError): CoordinationResult<never> {
  if (error.message.includes("Remove advisor assignments")) {
    return repositoryError(
      "advisor_has_assignments",
      "Remova os estágios atribuídos antes de retirar o papel de orientador.",
    );
  }

  return repositoryError(error.code, error.message);
}

async function getCoordinatorContext() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return {
      ok: false as const,
      error: {
        code: claimsError?.code ?? "not_authenticated",
        message: claimsError?.message ?? "Usuário autenticado é obrigatório.",
      },
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name,role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return { ok: false as const, error: profileError };
  }

  if (!profile || profile.role !== "coordinator") {
    return {
      ok: false as const,
      error: {
        code: "coordinator_role_required",
        message: "Esta área é exclusiva para coordenadores.",
      },
    };
  }

  return {
    ok: true as const,
    supabase,
    userId,
    coordinatorName: profile.full_name,
  };
}

type RawProfile = {
  id: string;
  full_name: string;
  registration_number: string | null;
  role: "student" | "advisor";
  created_at: string;
};

type RawRoleChange = {
  id: string;
  target_profile_id: string;
  previous_role: "student" | "advisor";
  requested_role: "student" | "advisor";
  created_at: string;
  target: { full_name: string } | null;
  actor: { full_name: string } | null;
};

export async function getCoordinationPeopleWorkspace(): Promise<
  CoordinationResult<CoordinationPeopleWorkspace>
> {
  const context = await getCoordinatorContext();

  if (!context.ok) {
    return { ok: false, error: context.error };
  }

  const [profilesResult, assignmentsResult, changesResult] = await Promise.all([
    context.supabase
      .from("profiles")
      .select("id,full_name,registration_number,role,created_at")
      .in("role", ["student", "advisor"])
      .order("full_name"),
    context.supabase
      .from("internships")
      .select("advisor_id")
      .not("advisor_id", "is", null),
    context.supabase
      .from("profile_role_change_requests")
      .select(
        "id,target_profile_id,previous_role,requested_role,created_at,target:profiles!profile_role_change_requests_target_profile_id_fkey(full_name),actor:profiles!profile_role_change_requests_actor_id_fkey(full_name)",
      )
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (profilesResult.error) {
    return databaseError(profilesResult.error);
  }

  if (assignmentsResult.error) {
    return databaseError(assignmentsResult.error);
  }

  if (changesResult.error) {
    return databaseError(changesResult.error);
  }

  const assignmentCount = new Map<string, number>();
  assignmentsResult.data.forEach(({ advisor_id }) => {
    if (advisor_id) {
      assignmentCount.set(advisor_id, (assignmentCount.get(advisor_id) ?? 0) + 1);
    }
  });

  const profiles = (profilesResult.data as RawProfile[]).map<ManageableProfile>(
    (profile) => ({
      id: profile.id,
      fullName: profile.full_name,
      registrationNumber: profile.registration_number,
      role: profile.role,
      assignedInternshipCount: assignmentCount.get(profile.id) ?? 0,
      createdAt: profile.created_at,
    }),
  );

  const recentChanges = (
    changesResult.data as unknown as RawRoleChange[]
  ).map<RoleChangeHistoryItem>((change) => ({
    id: change.id,
    targetProfileId: change.target_profile_id,
    targetName: change.target?.full_name ?? "Perfil",
    actorName: change.actor?.full_name ?? "Coordenação",
    previousRole: change.previous_role,
    requestedRole: change.requested_role,
    createdAt: change.created_at,
  }));

  return {
    ok: true,
    data: {
      coordinatorName: context.coordinatorName,
      profiles,
      recentChanges,
    },
  };
}

export async function changeAdvisorRole(
  input: AdvisorRoleChangeInput,
): Promise<CoordinationResult<{ id: string; role: "student" | "advisor" }>> {
  const parsed = advisorRoleChangeInputSchema.safeParse(input);

  if (!parsed.success) {
    return repositoryError(
      "invalid_role_change",
      parsed.error.issues[0]?.message ?? "Alteração de papel inválida.",
    );
  }

  const context = await getCoordinatorContext();

  if (!context.ok) {
    return { ok: false, error: context.error };
  }

  if (parsed.data.profileId === context.userId) {
    return repositoryError(
      "self_role_change",
      "O coordenador não pode alterar o próprio papel.",
    );
  }

  const { data: target, error: targetError } = await context.supabase
    .from("profiles")
    .select("id,role")
    .eq("id", parsed.data.profileId)
    .in("role", ["student", "advisor"])
    .maybeSingle();

  if (targetError) {
    return databaseError(targetError);
  }

  if (!target) {
    return repositoryError(
      "profile_not_manageable",
      "O perfil não existe ou não pode ter o papel alterado por esta tela.",
    );
  }

  if (target.role === parsed.data.role) {
    return {
      ok: true,
      data: { id: target.id, role: parsed.data.role },
    };
  }

  const payload = {
    target_profile_id: parsed.data.profileId,
    requested_role: parsed.data.role,
  } as unknown as TablesInsert<"profile_role_change_requests">;

  const { data, error } = await context.supabase
    .from("profile_role_change_requests")
    .insert(payload)
    .select("target_profile_id,requested_role")
    .single();

  if (error) {
    return databaseError(error);
  }

  return {
    ok: true,
    data: {
      id: data.target_profile_id,
      role: data.requested_role as "student" | "advisor",
    },
  };
}
