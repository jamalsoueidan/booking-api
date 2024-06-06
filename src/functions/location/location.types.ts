import { z } from "zod";
import { BooleanOrString, GidFormat, NumberOrString } from "~/library/zod";

export enum LocationTypes {
  HOME = "home",
  SALON = "salon",
  DESTINATION = "destination",
  VIRTUAL = "virtual",
}

export const LocationZodSchema = z.object({
  isDefault: BooleanOrString,
  metafieldId: z.string().optional(),
  locationType: z.nativeEnum(LocationTypes),
  customerId: GidFormat,
  name: z.string(),
  fullAddress: z.string(),
  city: z.string(),
  country: z.string(),
  distanceForFree: NumberOrString,
  distanceHourlyRate: NumberOrString,
  fixedRatePerKm: NumberOrString,
  minDriveDistance: NumberOrString,
  maxDriveDistance: NumberOrString,
  startFee: NumberOrString,
  deletedAt: z.coerce.date().optional(),
});

export type Location = z.infer<typeof LocationZodSchema>;
