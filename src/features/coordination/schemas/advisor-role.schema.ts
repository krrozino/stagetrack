import { z } from "zod";

export const advisorRoleChangeInputSchema = z.object({
  profileId: z.uuid(),
  role: z.enum(["student", "advisor"]),
});

export type AdvisorRoleChangeInput = z.infer<
  typeof advisorRoleChangeInputSchema
>;
