import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length > 0 ? value : null));

export const createActivityInputSchema = z
  .object({
    internshipId: z.uuid(),
    activityDate: z.string().regex(datePattern, "Informe uma data válida."),
    startTime: z.string().regex(timePattern, "Informe o horário inicial."),
    endTime: z.string().regex(timePattern, "Informe o horário final."),
    groupLabel: optionalText(160),
    teacherName: optionalText(160),
    description: z
      .string()
      .trim()
      .min(2, "Descreva a atividade realizada.")
      .max(4000),
    notes: optionalText(4000),
  })
  .refine(
    (value) => timeToMinutes(value.endTime) > timeToMinutes(value.startTime),
    {
      message: "O horário final deve ser posterior ao horário inicial.",
      path: ["endTime"],
    },
  );

export type CreateActivityInput = z.infer<typeof createActivityInputSchema>;
