import { z } from "zod";
import { _ } from "~/library/handler";

import { NumberOrString } from "~/library/zod";
import { UserProductsServiceGetUsersImage } from "../services/get-users-image";

export type ProductsControllerGetUsersImageRequest = {
  body: z.infer<typeof ProductsControllerGetUsersImageBodySchema>;
};

export const ProductsControllerGetUsersImageBodySchema = z.object({
  productIds: z.array(NumberOrString),
});

export type ProductsControllerGetUsersImageResponse = Awaited<
  ReturnType<typeof UserProductsServiceGetUsersImage>
>;

export const ProductsControllerGetUsersImage = _(
  async ({ body }: ProductsControllerGetUsersImageRequest) => {
    const bodyData = ProductsControllerGetUsersImageBodySchema.parse(body);
    return UserProductsServiceGetUsersImage(bodyData);
  }
);
