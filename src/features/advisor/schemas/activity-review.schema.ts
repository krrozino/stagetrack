import { z } from "zod";

export const activityReviewInputSchema = z
  .object({
    activityId: z.uuid(),
    decision: z.enum(["approved", "rejected"]),
    comment: z.string().trim().max(2000),
  })
  .superRefine((value, context) => {
    if (value.decision === "rejected" && value.comment.length < 3) {
      context.addIssue({
        code: "custom",
        path: ["comment"],
        message: "Informe uma justificativa para rejeitar a atividade.",
      });
    }
  });

export type ActivityReviewInput = z.infer<typeof activityReviewInputSchema>;
