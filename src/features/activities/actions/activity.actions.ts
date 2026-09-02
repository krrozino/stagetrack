"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createActivity } from "../repositories/activity.repository";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
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

  revalidatePath("/activities");
  revalidatePath("/dashboard");
  revalidatePath("/internships");
  redirect("/activities?created=1");
}
