import { z } from "zod";
import {
  BooleanOrStringType,
  GidFormat,
  NumberOrStringType,
} from "~/library/zod";

export enum LocationTypes {
  ORIGIN = "origin",
  DESTINATION = "destination",
}

export enum LocationOriginTypes {
  HOME = "home",
  COMMERCIAL = "commercial",
}
export const LocationZodSchema = z.object({
  isDefault: BooleanOrStringType,
  locationType: z.nativeEnum(LocationTypes),
  customerId: GidFormat,
  name: z.string(),
  fullAddress: z.string(),
  originType: z.nativeEnum(LocationOriginTypes),
  distanceForFree: NumberOrStringType,
  distanceHourlyRate: NumberOrStringType,
  fixedRatePerKm: NumberOrStringType,
  minDriveDistance: NumberOrStringType,
  maxDriveDistance: NumberOrStringType,
  startFee: NumberOrStringType,
  deletedAt: z.coerce.date().optional(),
});

export type Location = z.infer<typeof LocationZodSchema>;
