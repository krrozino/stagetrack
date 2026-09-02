import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/types/database";

import {
  advisorAssignmentInputSchema,
  type AdvisorAssignmentInput,
} from "../schemas/advisor-assignment.schema";
import type {
  AdvisorCandidate,
  CoordinationInternship,
  CoordinationResult,
  CoordinationWorkspace,
} from "../types";

function repositoryError(code: string, message: string): CoordinationResult<never> {
  return { ok: false, error: { code, message } };
}

function databaseError(error: PostgrestError): CoordinationResult<never> {
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
  role: "advisor" | "coordinator";
};

type RawCoordinationInternship = {
  id: string;
  status: CoordinationInternship["status"];
  start_date: string;
  advisor_id: string | null;
  student_id: string;
  student: {
    id: string;
    full_name: string;
    registration_number: string | null;
  } | null;
  advisor: {
    id: string;
    full_name: string;
    role: "advisor" | "coordinator";
  } | null;
  internship_types: { name: string } | null;
  organizations: { name: string } | null;
};

function mapAdvisor(profile: RawProfile): AdvisorCandidate {
  return {
    id: profile.id,
    fullName: profile.full_name,
    role: profile.role,
  };
}

function mapInternship(row: RawCoordinationInternship): CoordinationInternship {
  return {
    id: row.id,
    status: row.status,
    startDate: row.start_date,
    advisorId: row.advisor_id,
    advisorName: row.advisor?.full_name ?? null,
    studentId: row.student_id,
    studentName: row.student?.full_name ?? "Estudante",
    registrationNumber: row.student?.registration_number ?? null,
    internshipTypeName: row.internship_types?.name ?? "Estágio",
    organizationName: row.organizations?.name ?? "Concedente não informada",
  };
}

export async function getCoordinationWorkspace(): Promise<
  CoordinationResult<CoordinationWorkspace>
> {
  const context = await getCoordinatorContext();

  if (!context.ok) {
    return { ok: false, error: context.error };
  }

  const [advisorResult, internshipResult] = await Promise.all([
    context.supabase
      .from("profiles")
      .select("id,full_name,role")
      .in("role", ["advisor", "coordinator"])
      .order("full_name"),
    context.supabase
      .from("internships")
      .select(
        "id,status,start_date,advisor_id,student_id,student:profiles!internships_student_id_fkey(id,full_name,registration_number),advisor:profiles!internships_advisor_id_fkey(id,full_name,role),internship_types(name),organizations(name)",
      )
      .order("created_at", { ascending: false }),
  ]);

  if (advisorResult.error) {
    return databaseError(advisorResult.error);
  }

  if (internshipResult.error) {
    return databaseError(internshipResult.error);
  }

  return {
    ok: true,
    data: {
      coordinatorName: context.coordinatorName,
      advisors: (advisorResult.data as RawProfile[]).map(mapAdvisor),
      internships: (internshipResult.data as unknown as RawCoordinationInternship[]).map(
        mapInternship,
      ),
    },
  };
}

export async function assignAdvisor(
  input: AdvisorAssignmentInput,
): Promise<CoordinationResult<{ id: string; advisorId: string | null }>> {
  const parsed = advisorAssignmentInputSchema.safeParse(input);

  if (!parsed.success) {
    return repositoryError(
      "invalid_assignment_input",
      parsed.error.issues[0]?.message ?? "Vínculo de orientador inválido.",
    );
  }

  const context = await getCoordinatorContext();

  if (!context.ok) {
    return { ok: false, error: context.error };
  }

  if (parsed.data.advisorId) {
    const { data: candidate, error: candidateError } = await context.supabase
      .from("profiles")
      .select("id,role")
      .eq("id", parsed.data.advisorId)
      .in("role", ["advisor", "coordinator"])
      .maybeSingle();

    if (candidateError) {
      return databaseError(candidateError);
    }

    if (!candidate) {
      return repositoryError(
        "invalid_advisor",
        "O perfil selecionado não pode atuar como orientador.",
      );
    }
  }

  const payload: TablesUpdate<"internships"> = {
    advisor_id: parsed.data.advisorId,
  };

  const { data, error } = await context.supabase
    .from("internships")
    .update(payload)
    .eq("id", parsed.data.internshipId)
    .select("id,advisor_id")
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  if (!data) {
    return repositoryError(
      "internship_not_assignable",
      "O estágio não foi encontrado ou não está disponível para atribuição.",
    );
  }

  return {
    ok: true,
    data: {
      id: data.id,
      advisorId: data.advisor_id,
    },
  };
}
