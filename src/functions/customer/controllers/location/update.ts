import { z } from "zod";
import { LocationZodSchema } from "~/functions/location/location.types";

import { InvocationContext } from "@azure/functions";
import { _ } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";
import { CustomerLocationUpdateOrchestration } from "../../orchestrations/location/update";
import { CustomerLocationServiceUpdate } from "../../services/location/update";

export type CustomerLocationControllerUpdateRequest = {
  query: z.infer<typeof CustomerLocationControllerUpdateQuerySchema>;
  body: z.infer<typeof CustomerLocationControllerUpdateBodySchema>;
  context: InvocationContext;
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
  async ({ query, body, context }: CustomerLocationControllerUpdateRequest) => {
    const validateData =
      CustomerLocationControllerUpdateQuerySchema.parse(query);
    const validateBody =
      CustomerLocationControllerUpdateBodySchema.parse(body) || {};

    const location = await CustomerLocationServiceUpdate(
      validateData,
      validateBody
    );

    await CustomerLocationUpdateOrchestration(
      { locationId: location._id },
      context
    );

    return location;
  }
);
