import { z } from "zod";
import {
  PayoutAccountDetailsZodSchema,
  PayoutAccountType,
} from "../payout-account/payout-account.types";

export enum PayoutStatus {
  PENDING = "Pending",
  PROCESSED = "Processed",
  FAILED = "Failed",
}

export const PayoutZodSchema = z.object({
  customerId: z.number(),
  date: z.date(),
  amount: z.number(),
  currencyCode: z.string(),
  status: z.nativeEnum(PayoutStatus),
  payoutType: z.nativeEnum(PayoutAccountType).optional(),
  payoutDetails: PayoutAccountDetailsZodSchema.optional(),
});

export type Payout = z.infer<typeof PayoutZodSchema>;
