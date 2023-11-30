import { z } from "zod";

import { _ } from "~/library/handler";
import { UserProductServiceGet } from "../../services/products/get";

export type UserProductsControllerGetRequest = {
  query: z.infer<typeof UserProductsControllerGetQuerySchema>;
};

const UserProductsControllerGetQuerySchema = z.object({
  username: z.string(),
  productHandle: z.string(),
});

export type UserProductsControllerGetResponse = Awaited<
  ReturnType<typeof UserProductServiceGet>
>;

export const UserProductsControllerGet = _(
  async ({ query }: UserProductsControllerGetRequest) => {
    const validateQuery = UserProductsControllerGetQuerySchema.parse(query);
    return UserProductServiceGet(validateQuery);
  }
);
