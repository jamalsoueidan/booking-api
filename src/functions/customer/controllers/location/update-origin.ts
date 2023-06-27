import { z } from "zod";
import {
  LocationOriginZodSchema,
  LocationZodSchema,
} from "~/functions/location/location.types";
import { LocationServiceUpdate } from "~/functions/location/services";
import { _ } from "~/library/handler";

export type CustomerLocationControllerUpdateOriginRequest = {
  query: z.infer<typeof LocationServiceUpdateOriginSchema>;
  body: z.infer<typeof LocationServiceUpdateOriginBodySchema>;
};

export const LocationServiceUpdateOriginSchema = z.object({
  locationId: LocationZodSchema.shape._id,
  customerId: LocationZodSchema.shape.customerId,
});

export const LocationServiceUpdateOriginBodySchema =
  LocationOriginZodSchema.strict();

export type CustomerLocationControllerUpdateOriginResponse = Awaited<
  ReturnType<typeof LocationServiceUpdate>
>;

export const CustomerLocationControllerUpdateOrigin = _(
  ({ query, body }: CustomerLocationControllerUpdateOriginRequest) => {
    const validateData = LocationServiceUpdateOriginSchema.parse(query);
    const validateBody = LocationServiceUpdateOriginBodySchema.parse(body);
    return LocationServiceUpdate(validateData, validateBody);
  }
);
