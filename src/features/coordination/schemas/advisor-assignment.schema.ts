import { z } from "zod";

export const advisorAssignmentInputSchema = z.object({
  internshipId: z.uuid(),
  advisorId: z
    .union([z.uuid(), z.literal("")])
    .transform((value) => (value.length > 0 ? value : null)),
});

export type AdvisorAssignmentInput = z.infer<typeof advisorAssignmentInputSchema>;
