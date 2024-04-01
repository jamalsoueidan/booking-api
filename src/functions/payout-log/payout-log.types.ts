import { z } from "zod";
import { NumberOrStringType, ObjectIdType } from "~/library/zod";

export enum PayoutLogReferenceType {
  SHIPPING = "Shipping",
  LINE_ITEM = "LineItem",
}

export const PayoutLogZodSchema = z.object({
  customerId: z.number(),
  referenceType: z.nativeEnum(PayoutLogReferenceType),
  referenceId: z.union([NumberOrStringType, ObjectIdType]),
  orderId: z.number(),
  payout: ObjectIdType,
});

export type PayoutLog = z.infer<typeof PayoutLogZodSchema>;
