import { z } from "zod";
import { LocationZodSchema } from "~/functions/location/location.types";
import { StringOrObjectIdType } from "~/library/zod";

export const ShippingZodSchema = z.object({
  _id: StringOrObjectIdType,
  location: StringOrObjectIdType,
  origin: LocationZodSchema,
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
  cost: z.object({
    currency: z.string(),
    value: z.number(),
  }),
});

export type Shipping = z.infer<typeof ShippingZodSchema>;
