import { z } from "zod";
import { PayoutAccountZodSchema } from "~/functions/payout-account";
import { _ } from "~/library/handler";
import { CustomerPayoutAccountServiceCreate } from "../../services/payout-account/create";

export type CustomerPayoutAccountControllerCreateRequest = {
  query: z.infer<typeof CustomerPayoutAccountControllerQuerySchema>;
  body: z.infer<typeof CustomerPayoutAccountControllerCreateSchema>;
};

export const CustomerPayoutAccountControllerQuerySchema =
  PayoutAccountZodSchema.pick({
    customerId: true,
  }).strip();

export const CustomerPayoutAccountControllerCreateSchema =
  PayoutAccountZodSchema.omit({
    customerId: true,
  }).strip();

export type CustomerPayoutAccountControllerCreateResponse = Awaited<
  ReturnType<typeof CustomerPayoutAccountServiceCreate>
>;

export const CustomerPayoutAccountControllerCreate = _(
  ({ query, body }: CustomerPayoutAccountControllerCreateRequest) => {
    const validateBody =
      CustomerPayoutAccountControllerCreateSchema.parse(body);
    return CustomerPayoutAccountServiceCreate({ ...query, ...validateBody });
  }
);
