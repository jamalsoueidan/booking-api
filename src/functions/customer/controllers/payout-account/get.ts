import { z } from "zod";
import { PayoutAccountZodSchema } from "~/functions/payout-account";
import { _ } from "~/library/handler";
import { CustomerPayoutAccountServiceGet } from "../../services/payout-account/get";

export type CustomerPayoutAccountControllerGetRequest = {
  query: z.infer<typeof CustomerPayoutAccountControllerGetSchema>;
};

export const CustomerPayoutAccountControllerGetSchema =
  PayoutAccountZodSchema.pick({
    customerId: true,
  }).strip();

export type CustomerPayoutAccountControllerGetResponse = Awaited<
  ReturnType<typeof CustomerPayoutAccountServiceGet>
>;

export const CustomerPayoutAccountControllerGet = _(
  ({ query }: CustomerPayoutAccountControllerGetRequest) => {
    const validateQuery = CustomerPayoutAccountControllerGetSchema.parse(query);
    return CustomerPayoutAccountServiceGet(validateQuery);
  }
);
