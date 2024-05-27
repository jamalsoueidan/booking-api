import { InvocationContext } from "@azure/functions";
import { z } from "zod";
import { UserZodSchema } from "~/functions/user";
import { _ } from "~/library/handler";
import { CustomerUpdateOrchestration } from "../../orchestrations/customer/update";
import { CustomerServiceUpdate } from "../../services/customer/update";

export type CustomerControllerUpdateRequest = {
  query: CustomerControllerUpdateQuery;
  body: CustomerControllerUpdateBody;
  context: InvocationContext;
};

export const CustomerControllerUpdateQuerySchema = UserZodSchema.pick({
  customerId: true,
});

export type CustomerControllerUpdateQuery = z.infer<
  typeof CustomerControllerUpdateQuerySchema
>;

export const CustomerControllerUpdateSchema = UserZodSchema.omit({
  _id: true,
  active: true,
  isBusiness: true,
  username: true,
  userMetaobjectId: true,
  collectionMetaobjectId: true,
})
  .partial()
  .strip();

export type CustomerControllerUpdateBody = z.infer<
  typeof CustomerControllerUpdateSchema
>;

export type CustomerControllerUpdateResponse = Awaited<
  ReturnType<typeof CustomerServiceUpdate>
>;

export const CustomerControllerUpdate = _(
  async ({ query, body, context }: CustomerControllerUpdateRequest) => {
    const validateQuery = CustomerControllerUpdateQuerySchema.parse(query);
    const validateBody = CustomerControllerUpdateSchema.parse(body);
    const user = await CustomerServiceUpdate(validateQuery, validateBody);

    await CustomerUpdateOrchestration(user, context);

    return user;
  }
);
