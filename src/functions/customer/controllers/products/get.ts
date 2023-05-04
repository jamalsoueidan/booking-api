import { z } from "zod";
import { _ } from "~/library/handler";

import { UserZodSchema } from "~/functions/user";
import { CustomerProductsServiceGet } from "../../services/product";

export type CustomerProductsControllerGetRequest = {
  query: z.infer<typeof CustomerServiceGetUserByIdSchema>;
};

export const CustomerServiceGetUserByIdSchema = UserZodSchema.pick({
  customerId: true,
});

export type CustomerProductsControllerGetResponse = Awaited<
  ReturnType<typeof CustomerProductsServiceGet>
>;

export const CustomerProductsControllerGet = _(
  async ({ query }: CustomerProductsControllerGetRequest) => {
    const validateData = CustomerServiceGetUserByIdSchema.parse(query);
    return CustomerProductsServiceGet(validateData);
  }
);
