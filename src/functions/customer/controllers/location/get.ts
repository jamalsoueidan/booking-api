import { z } from "zod";

import { LocationZodSchema } from "~/functions/location/location.types";
import { _ } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";
import { CustomerLocationServiceGet } from "../../services/location/get";

export type CustomerLocationControllerGetOneRequest = {
  query: z.infer<typeof LocationServiceGetOneQuerySchema>;
};

export const LocationServiceGetOneQuerySchema = z.object({
  locationId: StringOrObjectId,
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerGetOneResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceGet>
>;

export const CustomerLocationControllerGetOne = _(
  ({ query }: CustomerLocationControllerGetOneRequest) => {
    const validateData = LocationServiceGetOneQuerySchema.parse(query);
    return CustomerLocationServiceGet(validateData);
  }
);
