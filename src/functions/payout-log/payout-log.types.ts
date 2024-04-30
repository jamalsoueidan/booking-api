import { z } from "zod";
import { NumberOrString, ObjectIdType } from "~/library/zod";

export enum PayoutLogReferenceType {
  SHIPPING = "Shipping",
  LINE_ITEM = "LineItem",
}

export const PayoutLogZodSchema = z.object({
  customerId: z.number(),
  referenceType: z.nativeEnum(PayoutLogReferenceType),
  referenceId: z.union([NumberOrString, ObjectIdType]),
  orderId: z.number(),
  orderCreatedAt: z.number().optional(),
  payout: ObjectIdType,
});

export type PayoutLog = z.infer<typeof PayoutLogZodSchema>;
