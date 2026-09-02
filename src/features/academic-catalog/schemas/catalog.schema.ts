import { z } from "zod";

export const catalogIdSchema = z.string().uuid();
