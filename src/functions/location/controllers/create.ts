import { z } from "zod";
import { _ } from "~/library/handler";
import { LocationZodSchema } from "../location.types";
import { LocationServiceCreate } from "../services/location.service";

export type LocationControllerCreateRequest = {
  body: z.infer<typeof LocationServiceCreateBodySchema>;
};

export const LocationServiceCreateBodySchema = LocationZodSchema.pick({
  name: true,
  fullAddress: true,
  locationType: true,
  customerId: true,
}).strict();

export type LocationControllerCreateResponse = Awaited<
  ReturnType<typeof LocationServiceCreate>
>;

export const LocationControllerCreate = _(
  ({ body }: LocationControllerCreateRequest) => {
    const validateBody = LocationServiceCreateBodySchema.parse(body);
    return LocationServiceCreate(validateBody);
  }
);
