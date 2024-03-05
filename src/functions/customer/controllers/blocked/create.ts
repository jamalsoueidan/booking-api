import { z } from "zod";
import { BlockDateZodSchema } from "~/functions/blocked/blocked.types";
import { _ } from "~/library/handler";
import { CustomerBlockedServiceCreate } from "../../services/blocked/create";
import { CustomerServiceUpdate } from "../../services/customer";

export type CustomerControllerCreateRequest = {
  query: z.infer<typeof CustomerBlockedControllerQuerySchema>;
  body: z.infer<typeof CustomerBlockedControllerCreateSchema>;
};

export const CustomerBlockedControllerQuerySchema = BlockDateZodSchema.pick({
  customerId: true,
}).strip();

export const CustomerBlockedControllerCreateSchema = BlockDateZodSchema.omit({
  customerId: true,
}).strip();

export type CustomerBlockedControllerCreateResponse = Awaited<
  ReturnType<typeof CustomerServiceUpdate>
>;

export const CustomerBlockedControllerCreate = _(
  ({ query, body }: CustomerControllerCreateRequest) => {
    const validateBody = CustomerBlockedControllerCreateSchema.parse(body);
    return CustomerBlockedServiceCreate({ ...query, ...validateBody });
  }
);
