import { z } from "zod";
import {
  GidFormat,
  NumberOrStringType,
  StringOrObjectIdType,
} from "~/library/zod";

export const LookupZodSchema = z.object({
  _id: StringOrObjectIdType,
  origin: z.object({
    customerId: GidFormat,
    name: z.string(),
    fullAddress: z.string(),
    minDistanceForFree: NumberOrStringType,
    distanceHourlyRate: NumberOrStringType,
    fixedRatePerKm: NumberOrStringType,
  }),
  destination: z.object({
    name: z.string(),
    fullAddress: z.string(),
  }),
  duration: z.object({
    text: z.string(),
    value: z.number(),
  }),
  distance: z.object({
    text: z.string(),
    value: z.number(),
  }),
});

export type Lookup = z.infer<typeof LookupZodSchema>;
