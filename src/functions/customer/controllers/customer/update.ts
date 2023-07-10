import { z } from "zod";
import { UserZodSchema } from "~/functions/user";
import { _ } from "~/library/handler";
import { CustomerServiceUpsert } from "../../services";

export type CustomerControllerUpdateRequest = {
  query: CustomerControllerUpdateQuery;
  body: CustomerControllerUpdateBody;
};

export const CustomerControllerUpdateQuerySchema = UserZodSchema.pick({
  customerId: true,
});

export type CustomerControllerUpdateQuery = z.infer<
  typeof CustomerControllerUpdateQuerySchema
>;

export const CustomerControllerUpdateSchema = UserZodSchema.omit({
  _id: true,
  customerId: true,
}).strip();

export type CustomerControllerUpdateBody = z.infer<
  typeof CustomerControllerUpdateSchema
>;

export type CustomerControllerUpdateResponse = Awaited<
  ReturnType<typeof CustomerServiceUpsert>
>;

export const CustomerControllerUpdate = _(
  ({ query, body }: CustomerControllerUpdateRequest) => {
    const validateQuery = CustomerControllerUpdateQuerySchema.parse(query);
    const validateBody = CustomerControllerUpdateSchema.parse(body);
    return CustomerServiceUpsert(validateQuery, validateBody);
  }
);
