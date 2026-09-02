import { z } from "zod";

const optionalUuid = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().uuid().nullable().optional(),
);

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().max(max).nullable().optional(),
  );

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().email().max(254).nullable().optional(),
);

const optionalDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.iso.date().nullable().optional(),
);

export const internshipRegistrationFormSchema = z
  .object({
    academicInstitutionId: z.string().uuid(),
    courseId: z.string().uuid(),
    internshipTypeId: z.string().uuid(),
    organizationMode: z.enum(["existing", "new"]),
    organizationId: optionalUuid,
    supervisorId: optionalUuid,
    newOrganizationName: optionalText(160),
    newOrganizationDocument: optionalText(40),
    newOrganizationEmail: optionalEmail,
    newOrganizationPhone: optionalText(40),
    newOrganizationAddress: optionalText(500),
    newOrganizationCity: optionalText(120),
    newOrganizationState: optionalText(120),
    newOrganizationPostalCode: optionalText(30),
    startDate: z.iso.date(),
    expectedEndDate: optionalDate,
  })
  .superRefine((input, ctx) => {
    if (input.organizationMode === "existing" && !input.organizationId) {
      ctx.addIssue({
        code: "custom",
        path: ["organizationId"],
        message: "Selecione a instituição concedente.",
      });
    }

    if (
      input.organizationMode === "new" &&
      (!input.newOrganizationName || input.newOrganizationName.length < 2)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["newOrganizationName"],
        message: "Informe o nome da nova concedente.",
      });
    }

    if (
      input.expectedEndDate &&
      input.expectedEndDate < input.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["expectedEndDate"],
        message: "A previsão de término não pode ser anterior ao início.",
      });
    }

    if (input.organizationMode === "new" && input.supervisorId) {
      ctx.addIssue({
        code: "custom",
        path: ["supervisorId"],
        message: "Cadastre o supervisor depois de criar a nova concedente.",
      });
    }
  });

export type InternshipRegistrationFormInput = z.output<
  typeof internshipRegistrationFormSchema
>;
