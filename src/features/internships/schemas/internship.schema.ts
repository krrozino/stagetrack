import { z } from "zod";

const optionalUuidSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim().length === 0) {
      return null;
    }

    return value;
  },
  z.string().uuid().nullable().optional(),
);

const optionalDateSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim().length === 0) {
      return null;
    }

    return value;
  },
  z.iso.date().nullable().optional(),
);

export const internshipIdSchema = z.string().uuid();

export const studentInternshipStatusSchema = z.enum([
  "active",
  "paused",
  "cancelled",
]);

export const createInternshipInputSchema = z
  .object({
    internshipTypeId: z.string().uuid(),
    organizationId: z.string().uuid(),
    supervisorId: optionalUuidSchema,
    startDate: z.iso.date(),
    expectedEndDate: optionalDateSchema,
  })
  .refine(
    (input) =>
      !input.expectedEndDate || input.expectedEndDate >= input.startDate,
    {
      message: "A data prevista de término não pode ser anterior ao início.",
      path: ["expectedEndDate"],
    },
  );

export const updateInternshipInputSchema = z
  .object({
    internshipTypeId: z.string().uuid().optional(),
    organizationId: z.string().uuid().optional(),
    supervisorId: optionalUuidSchema,
    startDate: z.iso.date().optional(),
    expectedEndDate: optionalDateSchema,
    status: studentInternshipStatusSchema.optional(),
  })
  .refine(
    (input) => Object.values(input).some((value) => value !== undefined),
    {
      message: "Informe ao menos um campo para atualizar.",
    },
  )
  .refine(
    (input) =>
      !input.startDate ||
      !input.expectedEndDate ||
      input.expectedEndDate >= input.startDate,
    {
      message: "A data prevista de término não pode ser anterior ao início.",
      path: ["expectedEndDate"],
    },
  );

export type CreateInternshipInput = z.output<
  typeof createInternshipInputSchema
>;
export type UpdateInternshipInput = z.output<
  typeof updateInternshipInputSchema
>;
export type StudentInternshipStatus = z.output<
  typeof studentInternshipStatusSchema
>;
