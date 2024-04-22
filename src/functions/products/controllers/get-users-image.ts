import { z } from "zod";
import { _ } from "~/library/handler";

import { NumberOrStringType } from "~/library/zod";
import { UserProductsServiceGetUsersImage } from "../services/get-users-image";

export type ProductsControllerGetUsersImageRequest = {
  query: z.infer<typeof ProductsControllerGetUsersImageBodySchema>;
};

export const ProductsControllerGetUsersImageBodySchema = z.object({
  productIds: z.array(NumberOrStringType),
});

export type ProductsControllerGetUsersImageResponse = Awaited<
  ReturnType<typeof UserProductsServiceGetUsersImage>
>;

export const ProductsControllerGetUsersImage = _(
  async ({ query }: ProductsControllerGetUsersImageRequest) => {
    const bodyData = ProductsControllerGetUsersImageBodySchema.parse(query);
    return UserProductsServiceGetUsersImage(bodyData);
  }
);
