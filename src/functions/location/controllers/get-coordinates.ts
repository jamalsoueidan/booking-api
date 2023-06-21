import { z } from "zod";
import { _ } from "~/library/handler";
import { LocationZodSchema } from "../location.types";
import { LocationServiceGetCoordinates } from "../services";

export type LocationControllerGetCoordinatesRequest = {
  query: z.infer<typeof LocationServiceGetCoordinatesSchema>;
};

export const LocationServiceGetCoordinatesSchema = LocationZodSchema.pick({
  fullAddress: true,
});

export type LocationControllerGetCoordinatesResponse = Awaited<
  ReturnType<typeof LocationServiceGetCoordinates>
>;

export const LocationControllerGetCoordinates = _(
  ({ query }: LocationControllerGetCoordinatesRequest) => {
    const validateData = LocationServiceGetCoordinatesSchema.parse(query);
    return LocationServiceGetCoordinates(validateData);
  }
);
