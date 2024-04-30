import { z } from "zod";
import { LocationZodSchema } from "~/functions/location/location.types";

import { _ } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";
import { CustomerLocationServiceUpdate } from "../../services/location/update";

// should be PATCH and UPSERT
export type CustomerLocationControllerUpdateRequest = {
  query: z.infer<typeof CustomerLocationControllerUpdateQuerySchema>;
  body: z.infer<typeof CustomerLocationControllerUpdateBodySchema>;
};

export const CustomerLocationControllerUpdateBodySchema =
  LocationZodSchema.omit({
    customerId: true,
    locationType: true,
    city: true,
    country: true,
    handle: true,
  }).strip();

export const CustomerLocationControllerUpdateQuerySchema = z.object({
  locationId: StringOrObjectId,
  customerId: LocationZodSchema.shape.customerId,
});

export type CustomerLocationControllerUpdateResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceUpdate>
>;

export const CustomerLocationControllerUpdate = _(
  ({ query, body }: CustomerLocationControllerUpdateRequest) => {
    const validateData =
      CustomerLocationControllerUpdateQuerySchema.parse(query);
    const validateBody =
      CustomerLocationControllerUpdateBodySchema.parse(body) || {};

    return CustomerLocationServiceUpdate(validateData, validateBody);
  }
);
