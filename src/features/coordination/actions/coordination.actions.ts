"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assignAdvisor } from "../repositories/coordination.repository";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function assignAdvisorAction(
  internshipId: string,
  formData: FormData,
) {
  const result = await assignAdvisor({
    internshipId,
    advisorId: field(formData, "advisorId"),
  });

  if (!result.ok) {
    const reason =
      result.error.code === "invalid_assignment_input" ||
      result.error.code === "invalid_advisor"
        ? "invalid"
        : "database";
    redirect(`/coordination?error=${reason}`);
  }

  revalidatePath("/coordination");
  revalidatePath("/advisor");
  revalidatePath("/activities");
  redirect("/coordination?updated=1");
}
