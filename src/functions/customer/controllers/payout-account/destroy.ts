import { z } from "zod";
import { PayoutAccountZodSchema } from "~/functions/payout-account";
import { _ } from "~/library/handler";
import { StringOrObjectIdType } from "~/library/zod";
import { CustomerPayoutAccountServiceDestroy } from "../../services/payout-account/destroy";

export type CustomerPayoutAccountControllerDestroyRequest = {
  query: z.infer<typeof CustomerPayoutAccountControllerDestroySchema>;
};

export const CustomerPayoutAccountControllerDestroySchema =
  PayoutAccountZodSchema.pick({
    customerId: true,
  })
    .extend({
      payoutAccountId: StringOrObjectIdType,
    })
    .strip();

export type CustomerPayoutAccountControllerDestroyResponse = Awaited<
  ReturnType<typeof CustomerPayoutAccountServiceDestroy>
>;

export const CustomerPayoutAccountControlleDestroy = _(
  ({ query }: CustomerPayoutAccountControllerDestroyRequest) => {
    const validateQuery =
      CustomerPayoutAccountControllerDestroySchema.parse(query);
    return CustomerPayoutAccountServiceDestroy(validateQuery);
  }
);
