import { z } from "zod";
import { GidFormat } from "~/library/zod";

export enum LocationTypes {
  ORIGIN = "origin",
  DESTINATION = "destination",
}

export const LocationZodSchema = z.object({
  _id: z.string(),
  locationType: z.nativeEnum(LocationTypes),
  customerId: GidFormat,
});

export type Location = z.infer<typeof LocationZodSchema>;

export const LocationOriginZodSchema = LocationZodSchema.extend({
  name: z.string(),
  fullAddress: z.string(),
  /*geoLocation: z.object({
    type: z.enum(["Point"]),
    coordinates: z.array(z.number()),
  })*/
});

export type LocationOrigin = z.infer<typeof LocationOriginZodSchema>;

export const LocationDestinationZodSchema = LocationZodSchema.extend({
  minDistanceForFree: z.number(),
  distanceHourlyRate: z.number(),
  fixedRatePerKm: z.number(),
});

export type LocationDestination = z.infer<typeof LocationDestinationZodSchema>;
