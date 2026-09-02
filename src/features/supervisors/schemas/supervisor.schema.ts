import { z } from "zod";

function optionalText(min: number, max: number) {
  return z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim().length === 0) {
        return null;
      }

      return value;
    },
    z.string().trim().min(min).max(max).nullable().optional(),
  );
}

const optionalEmail = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim().length === 0) {
      return null;
    }

    return value;
  },
  z.string().trim().email().max(254).nullable().optional(),
);

export const supervisorIdSchema = z.string().uuid();

export const supervisorInputSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().trim().min(2).max(160),
  email: optionalEmail,
  phone: optionalText(1, 40),
  position: optionalText(1, 160),
});

export type SupervisorInput = z.output<typeof supervisorInputSchema>;
