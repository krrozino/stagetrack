"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { updateInternship } from "../repositories/internship.repository";
import { studentInternshipStatusSchema } from "../schemas/internship.schema";

const internshipStatusActionSchema = z.object({
  internshipId: z.string().uuid(),
  status: studentInternshipStatusSchema,
});

export async function changeInternshipStatusAction(formData: FormData) {
  const parsed = internshipStatusActionSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    redirect("/internships?statusError=1");
  }

  const result = await updateInternship(parsed.data.internshipId, {
    status: parsed.data.status,
  });

  if (!result.ok) {
    redirect("/internships?statusError=1");
  }

  revalidatePath("/dashboard");
  revalidatePath("/internships");
  redirect("/internships?statusUpdated=1");
}
