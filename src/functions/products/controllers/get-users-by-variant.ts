import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrString } from "~/library/zod";
import { UserProductsServiceGetUsersVariant } from "../services/get-users-by-variant";

export type ProductsControllerGetUsersByVariantRequest = {
  query: z.infer<typeof ProductsControllerGetUsersByVariantSchema>;
};

export const ProductsControllerGetUsersByVariantSchema = z.object({
  productId: NumberOrString,
  nextCursor: z.string().optional(),
  limit: NumberOrString.optional(),
  variantId: NumberOrString.optional(),
});

export type ProductsControllerGetUsersByVariantResponse = Awaited<
  ReturnType<typeof UserProductsServiceGetUsersVariant>
>;

export const ProductsControllerGetUsersByVariant = _(
  async ({ query }: ProductsControllerGetUsersByVariantRequest) => {
    const validateData = ProductsControllerGetUsersByVariantSchema.parse(query);
    return await UserProductsServiceGetUsersVariant(validateData);
  }
);
