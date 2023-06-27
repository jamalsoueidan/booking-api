import { z } from "zod";
import {
  LocationDestinationZodSchema,
  LocationZodSchema,
} from "~/functions/location/location.types";
import { LocationServiceUpdate } from "~/functions/location/services";
import { _ } from "~/library/handler";

export type CustomerLocationControllerUpdateDestinationRequest = {
  query: z.infer<typeof LocationServiceUpdateDestinationSchema>;
  body: z.infer<typeof LocationServiceUpdateDestinationBodySchema>;
};

export const LocationServiceUpdateDestinationSchema = z.object({
  locationId: LocationZodSchema.shape._id,
  customerId: LocationZodSchema.shape.customerId,
});

export const LocationServiceUpdateDestinationBodySchema =
  LocationDestinationZodSchema.strict();

export type CustomerLocationControllerUpdateDestinationResponse = Awaited<
  ReturnType<typeof LocationServiceUpdate>
>;

export const CustomerLocationControllerUpdateDestination = _(
  ({ query, body }: CustomerLocationControllerUpdateDestinationRequest) => {
    const validateData = LocationServiceUpdateDestinationSchema.parse(query);
    const validateBody = LocationServiceUpdateDestinationBodySchema.parse(body);
    return LocationServiceUpdate(validateData, validateBody);
  }
);
