import { z } from "zod";
import {
  LocationDestinationZodSchema,
  LocationZodSchema,
} from "~/functions/location/location.types";
import { LocationServiceCreate } from "~/functions/location/services";
import { _ } from "~/library/handler";

export type CustomerLocationControllerCreateDestinationRequest = {
  query: z.infer<typeof LocationServiceCreateDestinationQuerySchema>;
  body: z.infer<typeof LocationServiceCreateDestinationBodySchema>;
};

export const LocationServiceCreateDestinationQuerySchema = z.object({
  customerId: LocationZodSchema.shape.customerId,
});

export const LocationServiceCreateDestinationBodySchema =
  LocationDestinationZodSchema.strict();

export type CustomerLocationControllerCreateDestinationResponse = Awaited<
  ReturnType<typeof LocationServiceCreate>
>;

export const CustomerLocationControllerCreateDestination = _(
  ({ query, body }: CustomerLocationControllerCreateDestinationRequest) => {
    const validateData =
      LocationServiceCreateDestinationQuerySchema.parse(query);
    const validateBody = LocationServiceCreateDestinationBodySchema.parse(body);
    return LocationServiceCreate({ ...validateData, ...validateBody });
  }
);
