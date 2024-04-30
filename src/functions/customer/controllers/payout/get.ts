import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrString, ObjectIdType } from "~/library/zod";
import { CustomerPayoutServiceGet } from "../../services/payout/get";

export type CustomerPayoutControllerGetRequest = {
  query: z.infer<typeof CustomerPayoutControllerGetSchema>;
};

export const CustomerPayoutControllerGetSchema = z.object({
  customerId: NumberOrString,
  payoutId: ObjectIdType,
});

export type CustomerPayoutControllerGetResponse = Awaited<
  ReturnType<typeof CustomerPayoutServiceGet>
>;

export const CustomerPayoutControllerGet = _(
  ({ query }: CustomerPayoutControllerGetRequest) => {
    const validateQuery = CustomerPayoutControllerGetSchema.parse(query);
    return CustomerPayoutServiceGet(validateQuery);
  }
);
