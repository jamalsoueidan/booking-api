import { z } from "zod";
import { NumberOrString } from "~/library/zod";

export enum PayoutAccountType {
  MOBILE_PAY = "MOBILE_PAY",
  BANK_ACCOUNT = "BANK_ACCOUNT",
}

export const PayoutAccountBankZodSchema = z.object({
  bankName: z.string(),
  regNum: z.number(),
  accountNum: z.number(),
});

export type PayoutAccountBank = z.infer<typeof PayoutAccountBankZodSchema>;

export const PayoutAccountMobilePayZodSchema = z.object({
  phoneNumber: NumberOrString,
});

export type PayoutAccountMobilePay = z.infer<
  typeof PayoutAccountMobilePayZodSchema
>;

export const PayoutAccountDetailsZodSchema = z.union([
  PayoutAccountBankZodSchema,
  PayoutAccountMobilePayZodSchema,
]);

export type PayoutAccountDetails = z.infer<
  typeof PayoutAccountDetailsZodSchema
>;

export const PayoutAccountZodSchema = z.object({
  customerId: NumberOrString,
  payoutType: z.nativeEnum(PayoutAccountType),
  payoutDetails: PayoutAccountDetailsZodSchema,
});

export type PayoutAccount = z.infer<typeof PayoutAccountZodSchema>;
