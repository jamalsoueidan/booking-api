import { z } from "zod";
import { _ } from "~/library/handler";

import { UserZodSchema } from "~/functions/user";

import { LocationZodSchema } from "~/functions/location";
import { NumberOrStringType, StringOrObjectIdType } from "~/library/zod";
import { CustomerAvailabilityServiceGet } from "../../services/availability";
import { CustomerProductsServiceListIds } from "../../services/product";

export type CustomerAvailabilityControllerGetRequest = {
  query: z.infer<typeof CustomerAvailabilityControllerGetQuerySchema>;
  body: z.infer<typeof CustomerAvailabilityControllerGetBodySchema>;
};

export const CustomerAvailabilityControllerGetQuerySchema = z.object({
  customerId: UserZodSchema.shape.customerId,
  locationId: StringOrObjectIdType,
});

export const CustomerAvailabilityControllerGetBodySchema = z.object({
  productIds: z.array(NumberOrStringType),
  startDate: z.string(),
  destination: LocationZodSchema.pick({
    name: true,
    fullAddress: true,
    originType: true,
  }).optional(),
});

export type CustomerAvailabilityControllerGetResponse = Awaited<
  ReturnType<typeof CustomerProductsServiceListIds>
>;

export const CustomerAvailabilityControllerGet = _(
  async ({ query, body }: CustomerAvailabilityControllerGetRequest) => {
    const filter = CustomerAvailabilityControllerGetQuerySchema.parse(query);
    const validBody = CustomerAvailabilityControllerGetBodySchema.parse(body);
    return CustomerAvailabilityServiceGet(filter, validBody);
  }
);
