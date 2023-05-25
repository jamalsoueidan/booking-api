import { z } from "zod";
import { UserZodSchema } from "~/functions/user";
import { _ } from "~/library/handler";
import { CustomerServiceUpsert } from "../../services";

export type CustomerControllerUpsertRequest = {
  query: CustomerControllerUpsertQuery;
  body: CustomerControllerUpsertBody;
};

export const CustomerControllerUpsertQuerySchema = UserZodSchema.pick({
  customerId: true,
});

export type CustomerControllerUpsertQuery = z.infer<
  typeof CustomerControllerUpsertQuerySchema
>;

export const CustomerControllerUpsertSchema = UserZodSchema.omit({
  _id: true,
  customerId: true,
}).strict(); // to remove active if user tried to insert this.

export type CustomerControllerUpsertBody = z.infer<
  typeof CustomerControllerUpsertSchema
>;

export type CustomerControllerUpsertResponse = Awaited<
  ReturnType<typeof CustomerServiceUpsert>
>;

export const CustomerControllerUpsert = _(
  ({ query, body }: CustomerControllerUpsertRequest) => {
    const validateQuery = CustomerControllerUpsertQuerySchema.parse(query);
    const validateBody = CustomerControllerUpsertSchema.parse(body);
    return CustomerServiceUpsert(validateQuery, validateBody);
  }
);
