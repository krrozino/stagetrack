"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import {
  listActiveCourses,
  listActiveInternshipTypes,
} from "@/features/academic-catalog";
import {
  createOrganization,
  listOrganizations,
} from "@/features/organizations";
import { listStudentSupervisors } from "@/features/supervisors";
import {
  getCurrentProfile,
  setCurrentProfileCourse,
} from "@/features/users";

import { createInternship } from "../repositories/internship.repository";
import { internshipRegistrationFormSchema } from "../schemas/internship-registration.schema";
import type {
  InternshipRegistrationActionState,
  InternshipRegistrationField,
} from "../types.registration";

function values(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function validationState(
  error: ZodError,
): InternshipRegistrationActionState {
  const fieldErrors: Partial<Record<InternshipRegistrationField, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && !(field in fieldErrors)) {
      fieldErrors[field as InternshipRegistrationField] = issue.message;
    }
  }

  return {
    status: "error",
    message: "Revise os campos destacados antes de continuar.",
    fieldErrors,
  };
}

function errorState(message: string): InternshipRegistrationActionState {
  return { status: "error", message };
}

export async function registerInternshipAction(
  _previousState: InternshipRegistrationActionState,
  formData: FormData,
): Promise<InternshipRegistrationActionState> {
  const parsed = internshipRegistrationFormSchema.safeParse(values(formData));

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  const input = parsed.data;

  const [profileResult, coursesResult, typesResult] = await Promise.all([
    getCurrentProfile(),
    listActiveCourses(input.academicInstitutionId),
    listActiveInternshipTypes(input.courseId),
  ]);

  if (!profileResult.ok || !profileResult.data) {
    return errorState("Não foi possível carregar seu perfil acadêmico.");
  }

  if (!coursesResult.ok || !coursesResult.data.some((course) => course.id === input.courseId)) {
    return errorState("O curso selecionado não pertence à instituição informada ou não está ativo.");
  }

  if (!typesResult.ok || !typesResult.data.some((type) => type.id === input.internshipTypeId)) {
    return errorState("A modalidade selecionada não pertence ao curso informado ou não está ativa.");
  }

  let organizationId: string;

  if (input.organizationMode === "new") {
    const organizationResult = await createOrganization({
      name: input.newOrganizationName ?? "",
      document: input.newOrganizationDocument,
      email: input.newOrganizationEmail,
      phone: input.newOrganizationPhone,
      address: input.newOrganizationAddress,
      city: input.newOrganizationCity,
      state: input.newOrganizationState,
      postalCode: input.newOrganizationPostalCode,
    });

    if (!organizationResult.ok) {
      return errorState(
        organizationResult.error.code === "23505"
          ? "Já existe uma concedente com esses dados. Selecione-a na lista existente."
          : "Não foi possível cadastrar a instituição concedente.",
      );
    }

    organizationId = organizationResult.data.id;
  } else {
    const organizationsResult = await listOrganizations();

    if (
      !organizationsResult.ok ||
      !input.organizationId ||
      !organizationsResult.data.some((organization) => organization.id === input.organizationId)
    ) {
      return errorState("A instituição concedente selecionada não está disponível.");
    }

    organizationId = input.organizationId;
  }

  if (input.supervisorId) {
    const supervisorsResult = await listStudentSupervisors();
    const supervisor = supervisorsResult.ok
      ? supervisorsResult.data.find((item) => item.id === input.supervisorId)
      : null;

    if (!supervisor || supervisor.organization_id !== organizationId) {
      return errorState("O supervisor selecionado não pertence à concedente informada.");
    }
  }

  const courseResult = await setCurrentProfileCourse(input.courseId);

  if (!courseResult.ok) {
    return errorState("Não foi possível vincular o curso ao seu perfil.");
  }

  const internshipResult = await createInternship({
    internshipTypeId: input.internshipTypeId,
    organizationId,
    supervisorId: input.supervisorId,
    startDate: input.startDate,
    expectedEndDate: input.expectedEndDate,
  });

  if (!internshipResult.ok) {
    return errorState(
      "Não foi possível cadastrar o estágio. Verifique modalidade, concedente, supervisor e datas.",
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/internships");
  redirect("/internships?created=1");
}
