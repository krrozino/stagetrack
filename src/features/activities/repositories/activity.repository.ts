import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database";

import {
  activityIdSchema,
  createActivityInputSchema,
  updateActivityInputSchema,
  type CreateActivityInput,
  type UpdateActivityInput,
} from "../schemas/activity.schema";
import type {
  ActivityLog,
  ActivityResult,
  ActivitySummary,
} from "../types";

const ACTIVITY_COLUMNS =
  "id,internship_id,student_id,activity_date,start_time,end_time,duration_minutes,group_label,teacher_name,description,notes,status,created_at,updated_at" as const;

function repositoryError(code: string, message: string): ActivityResult<never> {
  return { ok: false, error: { code, message } };
}

function databaseError(error: PostgrestError): ActivityResult<never> {
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

export async function createActivity(
  input: CreateActivityInput,
): Promise<ActivityResult<ActivityLog>> {
  const parsed = createActivityInputSchema.safeParse(input);

  if (!parsed.success) {
    return repositoryError(
      "invalid_activity_input",
      parsed.error.issues[0]?.message ?? "Dados da atividade inválidos.",
    );
  }

  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const clientPayload = {
    internship_id: parsed.data.internshipId,
    activity_date: parsed.data.activityDate,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    group_label: parsed.data.groupLabel,
    teacher_name: parsed.data.teacherName,
    description: parsed.data.description,
    notes: parsed.data.notes,
  };

  // `student_id`, `duration_minutes` and `status` are protected and prepared
  // by PostgreSQL. Generated types cannot infer values populated by triggers.
  const insertPayload =
    clientPayload as unknown as TablesInsert<"activity_logs">;

  const { data, error } = await auth.supabase
    .from("activity_logs")
    .insert(insertPayload)
    .select(ACTIVITY_COLUMNS)
    .single();

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function getActivity(
  activityId: string,
): Promise<ActivityResult<ActivityLog | null>> {
  const parsedId = activityIdSchema.safeParse(activityId);

  if (!parsedId.success) {
    return repositoryError("invalid_activity_id", "Atividade inválida.");
  }

  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("activity_logs")
    .select(ACTIVITY_COLUMNS)
    .eq("id", parsedId.data)
    .eq("student_id", auth.userId)
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function listActivities(
  internshipId: string,
): Promise<ActivityResult<ActivityLog[]>> {
  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("activity_logs")
    .select(ACTIVITY_COLUMNS)
    .eq("internship_id", internshipId)
    .eq("student_id", auth.userId)
    .order("activity_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    return databaseError(error);
  }

  return { ok: true, data };
}

export async function updateActivity(
  activityId: string,
  input: UpdateActivityInput,
): Promise<ActivityResult<ActivityLog>> {
  const parsedId = activityIdSchema.safeParse(activityId);
  const parsed = updateActivityInputSchema.safeParse(input);

  if (!parsedId.success) {
    return repositoryError("invalid_activity_id", "Atividade inválida.");
  }

  if (!parsed.success) {
    return repositoryError(
      "invalid_activity_input",
      parsed.error.issues[0]?.message ?? "Dados da atividade inválidos.",
    );
  }

  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const payload: TablesUpdate<"activity_logs"> = {
    activity_date: parsed.data.activityDate,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    group_label: parsed.data.groupLabel,
    teacher_name: parsed.data.teacherName,
    description: parsed.data.description,
    notes: parsed.data.notes,
  };

  const { data, error } = await auth.supabase
    .from("activity_logs")
    .update(payload)
    .eq("id", parsedId.data)
    .eq("student_id", auth.userId)
    .in("status", ["draft", "submitted"])
    .select(ACTIVITY_COLUMNS)
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  if (!data) {
    return repositoryError(
      "activity_not_editable",
      "A atividade não foi encontrada ou já foi revisada.",
    );
  }

  return { ok: true, data };
}

export async function deleteActivity(
  activityId: string,
): Promise<ActivityResult<{ id: string }>> {
  const parsedId = activityIdSchema.safeParse(activityId);

  if (!parsedId.success) {
    return repositoryError("invalid_activity_id", "Atividade inválida.");
  }

  const auth = await getAuthenticatedContext();

  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const { data, error } = await auth.supabase
    .from("activity_logs")
    .delete()
    .eq("id", parsedId.data)
    .eq("student_id", auth.userId)
    .in("status", ["draft", "submitted"])
    .select("id")
    .maybeSingle();

  if (error) {
    return databaseError(error);
  }

  if (!data) {
    return repositoryError(
      "activity_not_deletable",
      "A atividade não foi encontrada ou já foi revisada.",
    );
  }

  return { ok: true, data };
}

export async function getActivitySummary(
  internshipId: string,
): Promise<ActivityResult<ActivitySummary>> {
  const activitiesResult = await listActivities(internshipId);

  if (!activitiesResult.ok) {
    return activitiesResult;
  }

  const activities = activitiesResult.data;
  const counted = activities.filter((activity) => activity.status !== "rejected");

  return {
    ok: true,
    data: {
      totalMinutes: counted.reduce(
        (total, activity) => total + activity.duration_minutes,
        0,
      ),
      count: activities.length,
      lastActivityAt: activities[0]?.activity_date ?? null,
      recent: activities.slice(0, 5),
    },
  };
}
