import { z } from "zod";
import {
  GidFormat,
  NumberOrStringType,
  StringOrObjectIdType,
} from "~/library/zod";

export const ShippingZodSchema = z.object({
  _id: StringOrObjectIdType,
  location: StringOrObjectIdType,
  origin: z.object({
    customerId: GidFormat,
    name: z.string(),
    fullAddress: z.string(),
    distanceForFree: NumberOrStringType,
    distanceHourlyRate: NumberOrStringType,
    fixedRatePerKm: NumberOrStringType,
    startFee: NumberOrStringType,
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
  cost: z.number(),
});

export type Shipping = z.infer<typeof ShippingZodSchema>;
