import { z } from "zod";

const registrationNumberSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim().length === 0) {
      return null;
    }

    return value;
  },
  z.string().trim().min(1).max(50).nullable().optional(),
);

export const profileInputSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  registrationNumber: registrationNumberSchema,
});

export type ProfileInput = z.output<typeof profileInputSchema>;
