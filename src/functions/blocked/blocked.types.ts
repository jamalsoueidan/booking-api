import { z } from "zod";
import { GidFormat } from "~/library/zod";

export const BlockDateZodSchema = z.object({
  customerId: GidFormat,
  end: z.coerce.date(),
  start: z.coerce.date(),
});

export type Blocked = z.infer<typeof BlockDateZodSchema>;
