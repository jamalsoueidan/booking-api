import { z } from "zod";
import { _ } from "~/library/handler";
import { LocationOriginZodSchema } from "../location.types";
import { LocationServiceGetCoordinates } from "../services/location.service";

export type LocationControllerGetCoordinatesRequest = {
  query: z.infer<typeof LocationServiceGetCoordinatesSchema>;
};

export const LocationServiceGetCoordinatesSchema = LocationOriginZodSchema.pick(
  {
    fullAddress: true,
  }
);

export type LocationControllerGetCoordinatesResponse = Awaited<
  ReturnType<typeof LocationServiceGetCoordinates>
>;

export const LocationControllerGetCoordinates = _(
  ({ query }: LocationControllerGetCoordinatesRequest) => {
    const validateData = LocationServiceGetCoordinatesSchema.parse(query);
    return LocationServiceGetCoordinates(validateData);
  }
);
