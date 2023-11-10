import { z } from "zod";
import { LocationZodSchema } from "~/functions/location/location.types";
import { LocationServiceUpdate } from "~/functions/location/services/update";

import { _ } from "~/library/handler";
import { StringOrObjectIdType } from "~/library/zod";

// should be PATCH and UPSERT
export type CustomerLocationControllerUpdateRequest = {
  query: z.infer<typeof CustomerLocationControllerUpdateQuerySchema>;
  body: z.infer<typeof CustomerLocationControllerUpdateBodySchema>;
};

export const CustomerLocationControllerUpdateBodySchema =
  LocationZodSchema.omit({
    customerId: true,
    locationType: true,
  }).strip();

export const CustomerLocationControllerUpdateQuerySchema = z.object({
  locationId: StringOrObjectIdType,
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerUpdateResponse = Awaited<
  ReturnType<typeof LocationServiceUpdate>
>;

export const CustomerLocationControllerUpdate = _(
  ({ query, body }: CustomerLocationControllerUpdateRequest) => {
    const validateData =
      CustomerLocationControllerUpdateQuerySchema.parse(query);
    const validateBody =
      CustomerLocationControllerUpdateBodySchema.parse(body) || {};

    return LocationServiceUpdate(validateData, validateBody);
  }
);
