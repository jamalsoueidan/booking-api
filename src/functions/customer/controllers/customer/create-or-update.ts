import { z } from "zod";
import { UserZodSchema } from "~/functions/user";
import { _ } from "~/library/handler";
import { CustomerServiceCreateOrUpdate } from "../../services";

export type CustomerControllerCreateOrUpdateRequest = {
  query: CustomerControllerCreateOrUpdateQuery;
  body: CustomerControllerCreateOrUpdateBody;
};

export const CustomerControllerCreateOrUpdateQuerySchema = UserZodSchema.pick({
  customerId: true,
});

export type CustomerControllerCreateOrUpdateQuery = z.infer<
  typeof CustomerControllerCreateOrUpdateQuerySchema
>;

export const CustomerControllerCreateOrUpdateSchema = UserZodSchema.omit({
  _id: true,
  customerId: true,
});

export type CustomerControllerCreateOrUpdateBody = z.infer<
  typeof CustomerControllerCreateOrUpdateSchema
>;

export type CustomerControllerCreateOrUpdateResponse = Awaited<
  ReturnType<typeof CustomerServiceCreateOrUpdate>
>;

export const CustomerControllerCreateOrUpdate = _(
  ({ query, body }: CustomerControllerCreateOrUpdateRequest) => {
    const validateQuery =
      CustomerControllerCreateOrUpdateQuerySchema.parse(query);
    const validateBody = CustomerControllerCreateOrUpdateSchema.parse(body);
    return CustomerServiceCreateOrUpdate(validateQuery, validateBody);
  }
);
