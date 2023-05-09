import { z } from "zod";
import { _ } from "~/library/handler";

import { UserZodSchema } from "~/functions/user";
import { CustomerProductsServiceListIds } from "../../services/product";

export type CustomerProductsControllerListIdsRequest = {
  query: z.infer<typeof CustomerProductsControllerListIdsSchema>;
};

export const CustomerProductsControllerListIdsSchema = UserZodSchema.pick({
  customerId: true,
});

export type CustomerProductsControllerListIdsResponse = Awaited<
  ReturnType<typeof CustomerProductsServiceListIds>
>;

export const CustomerProductsControllerListIds = _(
  async ({ query }: CustomerProductsControllerListIdsRequest) => {
    const validateData = CustomerProductsControllerListIdsSchema.parse(query);
    return CustomerProductsServiceListIds(validateData);
  }
);
