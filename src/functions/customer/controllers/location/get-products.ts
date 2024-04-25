import { z } from "zod";

import { LocationZodSchema } from "~/functions/location/location.types";
import { _ } from "~/library/handler";
import { StringOrObjectIdType } from "~/library/zod";
import { CustomerLocationServiceGetProducts } from "../../services/location/get-products";

export type CustomerLocationControllerGetProductsRequest = {
  query: z.infer<typeof LocationServiceGetProductsQuerySchema>;
};

export const LocationServiceGetProductsQuerySchema = z.object({
  locationId: StringOrObjectIdType,
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerGetProductsResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceGetProducts>
>;

export const CustomerLocationControllerGetProducts = _(
  ({ query }: CustomerLocationControllerGetProductsRequest) => {
    const validateData = LocationServiceGetProductsQuerySchema.parse(query);
    return CustomerLocationServiceGetProducts(validateData);
  }
);
