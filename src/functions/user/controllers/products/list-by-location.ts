import { z } from "zod";
import { _ } from "~/library/handler";

import { NumberOrStringType, StringOrObjectIdType } from "~/library/zod";
import { UserProductsServiceListProductsByLocation } from "../../services/products/list-by-location";

export type UserProductsControllerListProductsByLocationRequest = {
  query: z.infer<typeof UserProductsControllerListProductsByLocationSchema>;
};

export const UserProductsControllerListProductsByLocationSchema = z.object({
  username: z.string(),
  productId: NumberOrStringType,
  locationId: StringOrObjectIdType,
});

export type UserProductsControllerListProductsByLocationResponse = Awaited<
  ReturnType<typeof UserProductsServiceListProductsByLocation>
>;

export const UserProductsControllerListProductsByLocation = _(
  async ({ query }: UserProductsControllerListProductsByLocationRequest) => {
    const validateData =
      UserProductsControllerListProductsByLocationSchema.parse(query);

    return UserProductsServiceListProductsByLocation(validateData);
  }
);
