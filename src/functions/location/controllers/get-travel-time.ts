import { z } from "zod";
import { _ } from "~/library/handler";
import { LocationServiceGetTravelTime } from "../services";

export type LocationControllerGetTravelTimeRequest = {
  query: z.infer<typeof LocationServiceGetTravelTimeSchema>;
};

export const LocationServiceGetTravelTimeSchema = z.object({
  origin: z.string(),
  destination: z.string(),
});

export type LocationControllerGetTravelTimeResponse = Awaited<
  ReturnType<typeof LocationServiceGetTravelTime>
>;

export const LocationControllerGetTravelTime = _(
  ({ query }: LocationControllerGetTravelTimeRequest) => {
    const validateData = LocationServiceGetTravelTimeSchema.parse(query);
    return LocationServiceGetTravelTime(validateData);
  }
);
