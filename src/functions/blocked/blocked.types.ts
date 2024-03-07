import { z } from "zod";
import { GidFormat } from "~/library/zod";

export const BlockDateZodSchema = z.object({
  customerId: GidFormat,
  end: z.coerce.date(),
  start: z.coerce.date(),
  title: z.string(),
  type: z.string().optional(),
});

export type Blocked = z.infer<typeof BlockDateZodSchema>;
