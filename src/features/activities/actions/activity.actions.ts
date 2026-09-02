"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createActivity,
  deleteActivity,
  updateActivity,
} from "../repositories/activity.repository";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function revalidateActivityViews() {
  revalidatePath("/activities");
  revalidatePath("/dashboard");
  revalidatePath("/internships");
}

export async function createActivityAction(formData: FormData) {
  const result = await createActivity({
    internshipId: field(formData, "internshipId"),
    activityDate: field(formData, "activityDate"),
    startTime: field(formData, "startTime"),
    endTime: field(formData, "endTime"),
    groupLabel: field(formData, "groupLabel"),
    teacherName: field(formData, "teacherName"),
    description: field(formData, "description"),
    notes: field(formData, "notes"),
  });

  if (!result.ok) {
    const reason = result.error.code === "invalid_activity_input" ? "invalid" : "database";
    redirect(`/activities?error=${reason}`);
  }

  revalidateActivityViews();
  redirect("/activities?created=1");
}

export async function updateActivityAction(
  activityId: string,
  formData: FormData,
) {
  const result = await updateActivity(activityId, {
    activityDate: field(formData, "activityDate"),
    startTime: field(formData, "startTime"),
    endTime: field(formData, "endTime"),
    groupLabel: field(formData, "groupLabel"),
    teacherName: field(formData, "teacherName"),
    description: field(formData, "description"),
    notes: field(formData, "notes"),
  });

  if (!result.ok) {
    const reason = result.error.code === "invalid_activity_input" ? "invalid" : "locked";
    redirect(`/activities/${activityId}/edit?error=${reason}`);
  }

  revalidateActivityViews();
  redirect("/activities?updated=1");
}

export async function deleteActivityAction(
  activityId: string,
  _formData: FormData,
) {
  const result = await deleteActivity(activityId);

  if (!result.ok) {
    redirect("/activities?error=delete");
  }

  revalidateActivityViews();
  redirect("/activities?deleted=1");
}
