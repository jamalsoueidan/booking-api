import { z } from "zod";
import { NumberOrStringType, ObjectIdType } from "~/library/zod";

export const PayoutLogZodSchema = z.object({
  customerId: NumberOrStringType,
  lineItemId: NumberOrStringType,
  payout: ObjectIdType,
  createdAt: z.date(),
});

export type PayoutLog = z.infer<typeof PayoutLogZodSchema>;
