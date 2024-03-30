import { z } from "zod";
import { BlockedZodSchema } from "~/functions/blocked/blocked.types";
import { _ } from "~/library/handler";
import { CustomerBlockedServiceCreate } from "../../services/blocked/create";

export type CustomerBlockedControllerCreateRequest = {
  query: z.infer<typeof CustomerBlockedControllerQuerySchema>;
  body: z.infer<typeof CustomerBlockedControllerCreateSchema>;
};

export const CustomerBlockedControllerQuerySchema = BlockedZodSchema.pick({
  customerId: true,
}).strip();

export const CustomerBlockedControllerCreateSchema = BlockedZodSchema.omit({
  customerId: true,
}).strip();

export type CustomerBlockedControllerCreateResponse = Awaited<
  ReturnType<typeof CustomerBlockedServiceCreate>
>;

export const CustomerBlockedControllerCreate = _(
  ({ query, body }: CustomerBlockedControllerCreateRequest) => {
    const validateBody = CustomerBlockedControllerCreateSchema.parse(body);
    return CustomerBlockedServiceCreate({ ...query, ...validateBody });
  }
);
