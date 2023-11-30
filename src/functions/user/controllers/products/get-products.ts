import { z } from "zod";
import { _ } from "~/library/handler";

import { StringOrObjectIdType } from "~/library/zod";
import { UserProductsServiceListProductsByLocation } from "../../services/products/list-by-location";

export type UserProductsControllerGetProductsByLocationRequest = {
  query: z.infer<typeof UserProductsControllerGetProductsByLocationQuerySchema>;
  body: z.infer<typeof UserProductsControllerGetProductsByLocationBodySchema>;
};

export const UserProductsControllerGetProductsByLocationQuerySchema = z.object({
  username: z.string(),
  locationId: StringOrObjectIdType,
});

export const UserProductsControllerGetProductsByLocationBodySchema = z.object({
  productHandlers: z.array(z.string()),
});

export type UserProductsControllerListProductsByLocationResponse = Awaited<
  ReturnType<typeof UserProductsServiceListProductsByLocation>
>;

export const UserProductsControllerGetProductsByLocation = _(
  async ({
    query,
    body,
  }: UserProductsControllerGetProductsByLocationRequest) => {
    const queryData =
      UserProductsControllerGetProductsByLocationQuerySchema.parse(query);
    const bodyData =
      UserProductsControllerGetProductsByLocationBodySchema.parse(body);

    return UserProductsServiceListProductsByLocation({
      ...queryData,
      productHandle: bodyData.productHandlers,
    });
  }
);
