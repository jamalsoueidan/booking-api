import { z } from "zod";
import { _ } from "~/library/handler";

import { NumberOrStringType } from "~/library/zod";
import { UserProductsServiceGetUsersImage } from "../services/get-users-image";

export type ProductsControllerGetUsersImageRequest = {
  query: z.infer<typeof ProductsControllerGetUsersImageQuerySchema>;
};

export const ProductsControllerGetUsersImageQuerySchema = z.object({
  productIds: z.array(NumberOrStringType),
});

export type ProductsControllerGetUsersImageResponse = Awaited<
  ReturnType<typeof UserProductsServiceGetUsersImage>
>;

export const ProductsControllerGetUsersImage = _(
  async ({ query }: ProductsControllerGetUsersImageRequest) => {
    const queryData = ProductsControllerGetUsersImageQuerySchema.parse(query);
    return UserProductsServiceGetUsersImage(queryData);
  }
);
