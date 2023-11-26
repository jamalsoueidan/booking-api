import { _ } from "~/library/handler";

import { z } from "zod";
import { NumberOrStringType } from "~/library/zod";
import { UserProductsServiceGetUsersVariant } from "../services/get-users-by-variant";

export type ProductsControllerGetUsersByVariantRequest = {
  query: z.infer<typeof ProductsControllerGetUsersByVariantSchema>;
};

export const ProductsControllerGetUsersByVariantSchema = z.object({
  nextCursor: z.string().optional(),
  limit: NumberOrStringType.optional(),
  productId: NumberOrStringType,
  variantId: NumberOrStringType,
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
