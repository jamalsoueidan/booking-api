import { z } from "zod";
import { _ } from "~/library/handler";

import { NumberOrStringType } from "~/library/zod";
import { UserProductsServiceGetUsers } from "../services/get-users";

export type ProductsControllerGetUsersRequest = {
  body: z.infer<typeof ProductsControllerGetUsersBodySchema>;
};

export const ProductsControllerGetUsersBodySchema = z.object({
  productIds: z.array(NumberOrStringType),
});

export type ProductsControllerGetUsersResponse = Awaited<
  ReturnType<typeof UserProductsServiceGetUsers>
>;

export const ProductsControllerGetUsers = _(
  async ({ body }: ProductsControllerGetUsersRequest) => {
    const bodyData = ProductsControllerGetUsersBodySchema.parse(body);
    return UserProductsServiceGetUsers(bodyData);
  }
);
