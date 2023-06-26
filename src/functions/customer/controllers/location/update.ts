import { z } from "zod";
import {
  LocationDestinationZodSchema,
  LocationOriginZodSchema,
  LocationZodSchema,
} from "~/functions/location/location.types";
import { LocationServiceUpdate } from "~/functions/location/services";
import { _ } from "~/library/handler";

export type CustomerLocationControllerUpdateRequest = {
  query: z.infer<typeof LocationServiceUpdateSchema>;
  body: z.infer<typeof LocationServiceUpdateBodySchema>;
};

export const LocationServiceUpdateSchema = z.object({
  locationId: LocationZodSchema.shape._id,
  customerId: LocationZodSchema.shape.customerId,
});

export const LocationServiceUpdateBodySchema = LocationOriginZodSchema.merge(
  LocationDestinationZodSchema
).strict();

export type CustomerLocationControllerUpdateResponse = Awaited<
  ReturnType<typeof LocationServiceUpdate>
>;

export const CustomerLocationControllerUpdate = _(
  ({ query, body }: CustomerLocationControllerUpdateRequest) => {
    const validateData = LocationServiceUpdateSchema.parse(query);
    const validateBody = LocationServiceUpdateBodySchema.parse(body);
    return LocationServiceUpdate(validateData, validateBody);
  }
);
