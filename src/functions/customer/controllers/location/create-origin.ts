import { z } from "zod";
import {
  LocationOriginZodSchema,
  LocationTypes,
  LocationZodSchema,
} from "~/functions/location/location.types";
import { LocationServiceCreate } from "~/functions/location/services";
import { _ } from "~/library/handler";

export type CustomerLocationControllerCreateOriginRequest = {
  query: z.infer<typeof LocationServiceCreateOriginQuerySchema>;
  body: z.infer<typeof LocationServiceCreateOriginBodySchema>;
};

export const LocationServiceCreateOriginQuerySchema = z.object({
  customerId: LocationZodSchema.shape.customerId,
});

export const LocationServiceCreateOriginBodySchema =
  LocationOriginZodSchema.strict();

export type CustomerLocationControllerCreateOriginResponse = Awaited<
  ReturnType<typeof LocationServiceCreate>
>;

export const CustomerLocationControllerCreateOrigin = _(
  ({ query, body }: CustomerLocationControllerCreateOriginRequest) => {
    const validateData = LocationServiceCreateOriginQuerySchema.parse(query);
    const validateBody = LocationServiceCreateOriginBodySchema.parse(body);
    return LocationServiceCreate({
      ...validateData,
      ...validateBody,
      locationType: LocationTypes.ORIGIN,
    });
  }
);
