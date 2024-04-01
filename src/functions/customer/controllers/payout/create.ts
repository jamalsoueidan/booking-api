import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrStringType } from "~/library/zod";
import { CustomerPayoutServiceCreate } from "../../services/payout/create";
import { CustomerPayoutServiceGet } from "../../services/payout/get";

export type CustomerPayoutControllerCreateRequest = {
  query: z.infer<typeof CustomerPayoutControllerCreateSchema>;
};

export const CustomerPayoutControllerCreateSchema = z.object({
  customerId: NumberOrStringType,
});

export type CustomerPayoutControllerCreateResponse = Awaited<
  ReturnType<typeof CustomerPayoutServiceGet>
>;

export const CustomerPayoutControllerCreate = _(
  ({ query }: CustomerPayoutControllerCreateRequest) => {
    const validateQuery = CustomerPayoutControllerCreateSchema.parse(query);
    return CustomerPayoutServiceCreate(validateQuery);
  }
);
