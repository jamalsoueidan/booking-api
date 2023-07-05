import { z } from "zod";
import {
  LocationDestinationZodSchema,
  LocationTypes,
  LocationZodSchema,
} from "~/functions/location/location.types";
import { LocationServiceCreate } from "~/functions/location/services";
import { _ } from "~/library/handler";

export type CustomerLocationControllerCreateRequest = {
  query: z.infer<typeof LocationServiceCreateOriginQuerySchema>;
  body:
    | z.infer<typeof LocationZodSchema>
    | z.infer<typeof LocationDestinationZodSchema>;
};

export const LocationServiceCreateOriginQuerySchema = z.object({
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerCreateResponse = Awaited<
  ReturnType<typeof LocationServiceCreate>
>;

export const CustomerLocationControllerCreate = _(
  ({ query, body }: CustomerLocationControllerCreateRequest) => {
    const validateData = LocationServiceCreateOriginQuerySchema.parse(query);

    const validateBody =
      body.locationType === LocationTypes.ORIGIN
        ? LocationZodSchema.parse(body)
        : LocationDestinationZodSchema.parse(body);

    return LocationServiceCreate({
      ...validateData,
      ...validateBody,
    });
  }
);
