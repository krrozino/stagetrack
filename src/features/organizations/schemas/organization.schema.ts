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

export const organizationIdSchema = z.string().uuid();

export const organizationInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  document: optionalText(1, 40),
  email: optionalEmail,
  phone: optionalText(1, 40),
  address: optionalText(1, 500),
  city: optionalText(1, 120),
  state: optionalText(1, 120),
  postalCode: optionalText(1, 30),
});

export type OrganizationInput = z.output<typeof organizationInputSchema>;
