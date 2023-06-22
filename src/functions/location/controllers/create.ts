import { z } from "zod";
import { _ } from "~/library/handler";
import { LocationZodSchema } from "../location.types";
import { LocationServiceCreate } from "../services/location.service";

export type LocationControllerCreateRequest = {
  query: z.infer<typeof LocationServiceCreateSchema>;
  body: z.infer<typeof LocationServiceCreateBodySchema>;
};

export const LocationServiceCreateSchema = LocationZodSchema.pick({
  customerId: true,
});

export const LocationServiceCreateBodySchema = LocationZodSchema.pick({
  name: true,
  fullAddress: true,
  locationType: true,
}).strict();

export type LocationControllerCreateResponse = Awaited<
  ReturnType<typeof LocationServiceCreate>
>;

export const LocationControllerCreate = _(
  ({ query, body }: LocationControllerCreateRequest) => {
    const validateData = LocationServiceCreateSchema.parse(query);
    const validateBody = LocationServiceCreateBodySchema.parse(body);
    return LocationServiceCreate({ ...validateData, ...validateBody });
  }
);
