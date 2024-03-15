import { z } from "zod";

import { LocationZodSchema } from "~/functions/location/location.types";
import { _ } from "~/library/handler";
import { StringOrObjectIdType } from "~/library/zod";
import { CustomerLocationServiceDestroy } from "../../services/location/destroy";

export type CustomerLocationControllerRemoveRequest = {
  query: z.infer<typeof LocationServiceRemoveQuerySchema>;
};

export const LocationServiceRemoveQuerySchema = z.object({
  locationId: StringOrObjectIdType,
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerRemoveResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceDestroy>
>;

export const CustomerLocationControllerRemove = _(
  ({ query }: CustomerLocationControllerRemoveRequest) => {
    const validateData = LocationServiceRemoveQuerySchema.parse(query);
    return CustomerLocationServiceDestroy(validateData);
  }
);
