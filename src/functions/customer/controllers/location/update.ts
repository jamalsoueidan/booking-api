import { z } from "zod";
import {
  LocationDestinationZodSchema,
  LocationTypes,
  LocationZodSchema,
} from "~/functions/location/location.types";
import { LocationServiceUpdate } from "~/functions/location/services";
import { _ } from "~/library/handler";
import { StringOrObjectIdType } from "~/library/zod";

export type CustomerLocationControllerUpdateRequest = {
  query: z.infer<typeof LocationServiceUpdateSchema>;
  body:
    | z.infer<typeof LocationZodSchema>
    | z.infer<typeof LocationDestinationZodSchema>;
};

export const LocationServiceUpdateSchema = z.object({
  locationId: StringOrObjectIdType,
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerUpdateResponse = Awaited<
  ReturnType<typeof LocationServiceUpdate>
>;

export const CustomerLocationControllerUpdate = _(
  ({ query, body }: CustomerLocationControllerUpdateRequest) => {
    const validateData = LocationServiceUpdateSchema.parse(query);
    const validateBody =
      body.locationType === LocationTypes.ORIGIN
        ? LocationZodSchema.parse(body)
        : LocationDestinationZodSchema.parse(body);

    return LocationServiceUpdate(validateData, validateBody);
  }
);
