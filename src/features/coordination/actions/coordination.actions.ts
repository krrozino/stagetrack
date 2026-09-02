"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assignAdvisor } from "../repositories/coordination.repository";
import { changeAdvisorRole } from "../repositories/role-management.repository";

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

export async function changeAdvisorRoleAction(
  profileId: string,
  formData: FormData,
) {
  const result = await changeAdvisorRole({
    profileId,
    role: field(formData, "role"),
  });

  if (!result.ok) {
    const reason =
      result.error.code === "advisor_has_assignments"
        ? "assigned"
        : result.error.code === "invalid_role_change" ||
            result.error.code === "profile_not_manageable" ||
            result.error.code === "self_role_change"
          ? "invalid"
          : "database";
    redirect(`/coordination/people?error=${reason}`);
  }

  revalidatePath("/coordination/people");
  revalidatePath("/coordination");
  revalidatePath("/advisor");
  redirect(`/coordination/people?updated=${result.data.role}`);
}
