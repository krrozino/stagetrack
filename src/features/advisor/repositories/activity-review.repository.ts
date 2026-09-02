import type { PostgrestError } from "@supabase/supabase-js";

import type {
  ActivityLog,
  ActivityStatusEvent,
} from "@/features/activities";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/types/database";

import {
  activityReviewInputSchema,
  type ActivityReviewInput,
} from "../schemas/activity-review.schema";
import type {
  AdvisorResult,
  AdvisorWorkspace,
  AssignedInternshipSummary,
  ReviewQueueItem,
  ReviewerRole,
} from "../types";

function repositoryError(code: string, message: string): AdvisorResult<never> {
  return { ok: false, error: { code, message } };
}

function databaseError(error: PostgrestError): AdvisorResult<never> {
  return repositoryError(error.code, error.message);
}

async function getReviewerContext() {
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

  if (!profile || (profile.role !== "advisor" && profile.role !== "coordinator")) {
    return {
      ok: false as const,
      error: {
        code: "reviewer_role_required",
        message: "Esta área é exclusiva para orientadores e coordenadores.",
      },
    };
  }

  return {
    ok: true as const,
    supabase,
    userId,
    reviewerName: profile.full_name,
    role: profile.role as ReviewerRole,
  };
}

type RawAssignedInternship = {
  id: string;
  student_id: string;
  status: AssignedInternshipSummary["status"];
  student: {
    full_name: string;
    registration_number: string | null;
  } | null;
  internship_types: { name: string } | null;
  organizations: { name: string } | null;
};

function mapAssignedInternship(
  internship: RawAssignedInternship,
): AssignedInternshipSummary {
  return {
    id: internship.id,
    studentId: internship.student_id,
    studentName: internship.student?.full_name ?? "Estudante",
    registrationNumber: internship.student?.registration_number ?? null,
    internshipTypeName: internship.internship_types?.name ?? "Estágio",
    organizationName: internship.organizations?.name ?? "Concedente não informada",
    status: internship.status,
  };
}

export async function getAdvisorWorkspace(): Promise<
  AdvisorResult<AdvisorWorkspace>
> {
  const context = await getReviewerContext();

  if (!context.ok) {
    return { ok: false, error: context.error };
  }

  const { data: internshipRows, error: internshipError } = await context.supabase
    .from("internships")
    .select(
      "id,student_id,status,student:profiles!internships_student_id_fkey(full_name,registration_number),internship_types(name),organizations(name)",
    )
    .eq("advisor_id", context.userId)
    .neq("student_id", context.userId)
    .order("created_at", { ascending: false });

  if (internshipError) {
    return databaseError(internshipError);
  }

  const internships = (internshipRows as unknown as RawAssignedInternship[]).map(
    mapAssignedInternship,
  );
  const internshipIds = internships.map((internship) => internship.id);

  if (internshipIds.length === 0) {
    return {
      ok: true,
      data: {
        reviewerName: context.reviewerName,
        role: context.role,
        internships: [],
        pending: [],
        reviewed: [],
        events: [],
      },
    };
  }

  const [{ data: activityRows, error: activityError }, eventResult] =
    await Promise.all([
      context.supabase
        .from("activity_logs")
        .select("*")
        .in("internship_id", internshipIds)
        .order("activity_date", { ascending: false })
        .order("start_time", { ascending: false }),
      context.supabase
        .from("activity_status_events" as "activity_logs")
        .select("*")
        .in("internship_id", internshipIds)
        .order("created_at", { ascending: false }),
    ]);

  if (activityError) {
    return databaseError(activityError);
  }

  if (eventResult.error) {
    return databaseError(eventResult.error);
  }

  const internshipById = new Map(
    internships.map((internship) => [internship.id, internship]),
  );
  const activities = activityRows as unknown as ActivityLog[];
  const workspaceItems = activities.flatMap<ReviewQueueItem>((activity) => {
    const internship = internshipById.get(activity.internship_id);
    return internship ? [{ ...activity, internship }] : [];
  });

  return {
    ok: true,
    data: {
      reviewerName: context.reviewerName,
      role: context.role,
      internships,
      pending: workspaceItems.filter((activity) => activity.status === "submitted"),
      reviewed: workspaceItems
        .filter(
          (activity) =>
            activity.status === "approved" || activity.status === "rejected",
        )
        .slice(0, 20),
      events: eventResult.data as unknown as ActivityStatusEvent[],
    },
  };
}

export async function reviewActivity(
  input: ActivityReviewInput,
): Promise<AdvisorResult<ActivityLog>> {
  const parsed = activityReviewInputSchema.safeParse(input);

  if (!parsed.success) {
    return repositoryError(
      "invalid_review_input",
      parsed.error.issues[0]?.message ?? "Revisão inválida.",
    );
  }

  const context = await getReviewerContext();

  if (!context.ok) {
    return { ok: false, error: context.error };
  }

  const payload = {
    status: parsed.data.decision,
    review_comment: parsed.data.comment.length > 0 ? parsed.data.comment : null,
  } as unknown as TablesUpdate<"activity_logs">;

  const { data, error } = await context.supabase
    .from("activity_logs")
    .update(payload)
    .eq("id", parsed.data.activityId)
    .eq("status", "submitted")
    .neq("student_id", context.userId)
    .select("*")
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  if (!data) {
    return repositoryError(
      "activity_not_reviewable",
      "A atividade não está pendente ou não pertence a um estágio atribuído a você.",
    );
  }

  return { ok: true, data: data as unknown as ActivityLog };
}
