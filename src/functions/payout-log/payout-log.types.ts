import { z } from "zod";
import { NumberOrStringType, ObjectIdType } from "~/library/zod";

export enum PayoutLogReferenceType {
  SHIPPING = "Shipping",
  LINE_ITEM = "LineItem",
}

export const PayoutLogZodSchema = z.object({
  customerId: NumberOrStringType,
  referenceType: z.nativeEnum(PayoutLogReferenceType),
  referenceId: NumberOrStringType,
  payout: ObjectIdType,
});

export type PayoutLog = z.infer<typeof PayoutLogZodSchema>;
