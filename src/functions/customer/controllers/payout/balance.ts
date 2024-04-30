import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrString } from "~/library/zod";
import { CustomerPayoutServiceBalance } from "../../services/payout/balance";

export type CustomerPayoutControllerBalanceRequest = {
  query: z.infer<typeof CustomerPayoutControllerBalanceSchema>;
};

export const CustomerPayoutControllerBalanceSchema = z.object({
  customerId: NumberOrString,
});

export type CustomerPayoutControllerBalanceResponse = Awaited<
  ReturnType<typeof CustomerPayoutServiceBalance>
>;

export const CustomerPayoutControllerBalance = _(
  ({ query }: CustomerPayoutControllerBalanceRequest) => {
    const validateQuery = CustomerPayoutControllerBalanceSchema.parse(query);
    return CustomerPayoutServiceBalance(validateQuery);
  }
);
