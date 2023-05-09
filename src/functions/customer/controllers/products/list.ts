import { z } from "zod";
import { _ } from "~/library/handler";

import { UserZodSchema } from "~/functions/user";
import { CustomerProductsServiceList } from "../../services/product";

export type CustomerProductsControllerListRequest = {
  query: z.infer<typeof CustomerProductsControllerListSchema>;
};

export const CustomerProductsControllerListSchema = UserZodSchema.pick({
  customerId: true,
});

export type CustomerProductsControllerListResponse = Awaited<
  ReturnType<typeof CustomerProductsServiceList>
>;

export const CustomerProductsControllerList = _(
  async ({ query }: CustomerProductsControllerListRequest) => {
    const validateData = CustomerProductsControllerListSchema.parse(query);
    return CustomerProductsServiceList(validateData);
  }
);
