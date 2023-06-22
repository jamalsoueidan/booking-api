import { z } from "zod";
import { _ } from "~/library/handler";
import { LocationZodSchema } from "../location.types";
import { LocationServiceUpdate } from "../services/location.service";

export type LocationControllerUpdateRequest = {
  query: z.infer<typeof LocationServiceUpdateSchema>;
  body: z.infer<typeof LocationServiceUpdateBodySchema>;
};

export const LocationServiceUpdateSchema = z.object({
  locationId: LocationZodSchema.shape._id,
  customerId: LocationZodSchema.shape.customerId,
});

export const LocationServiceUpdateBodySchema = LocationZodSchema.pick({
  name: true,
  fullAddress: true,
  locationType: true,
}).strict();

export type LocationControllerUpdateResponse = Awaited<
  ReturnType<typeof LocationServiceUpdate>
>;

export const LocationControllerUpdate = _(
  ({ query, body }: LocationControllerUpdateRequest) => {
    const validateData = LocationServiceUpdateSchema.parse(query);
    const validateBody = LocationServiceUpdateBodySchema.parse(body);
    return LocationServiceUpdate(validateData, validateBody);
  }
);
