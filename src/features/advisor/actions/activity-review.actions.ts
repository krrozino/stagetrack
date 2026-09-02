"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { reviewActivity } from "../repositories/activity-review.repository";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function reviewActivityAction(formData: FormData) {
  const decision = field(formData, "decision");
  const result = await reviewActivity({
    activityId: field(formData, "activityId"),
    decision: decision === "rejected" ? "rejected" : "approved",
    comment: field(formData, "comment"),
  });

  if (!result.ok) {
    const reason =
      result.error.code === "invalid_review_input" ? "invalid" : "not-reviewable";
    redirect(`/advisor?error=${reason}`);
  }

  revalidatePath("/advisor");
  revalidatePath("/activities");
  revalidatePath("/dashboard");
  revalidatePath("/internships");
  redirect(`/advisor?reviewed=${result.data.status}`);
}
