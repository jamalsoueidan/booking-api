import { z } from "zod";
import {
  LocationDestinationZodSchema,
  LocationOriginZodSchema,
  LocationZodSchema,
} from "~/functions/location/location.types";
import { LocationServiceCreate } from "~/functions/location/services";
import { _ } from "~/library/handler";

export type CustomerLocationControllerCreateRequest = {
  query: z.infer<typeof LocationServiceCreateQuerySchema>;
  body: z.infer<typeof LocationServiceCreateBodySchema>;
};

export const LocationServiceCreateQuerySchema = z.object({
  customerId: LocationZodSchema.shape.customerId,
});

export const LocationServiceCreateBodySchema = LocationOriginZodSchema.merge(
  LocationDestinationZodSchema
).strict();

export type CustomerLocationControllerCreateResponse = Awaited<
  ReturnType<typeof LocationServiceCreate>
>;

export const CustomerLocationControllerCreate = _(
  ({ query, body }: CustomerLocationControllerCreateRequest) => {
    const validateData = LocationServiceCreateQuerySchema.parse(query);
    const validateBody = LocationServiceCreateBodySchema.parse(body);
    return LocationServiceCreate({ ...validateData, ...validateBody });
  }
);
