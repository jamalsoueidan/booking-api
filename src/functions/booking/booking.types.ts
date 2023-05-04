import { z } from "zod";

import { objectIdIsValid } from "~/library/handler/validate";

export enum BookingFulfillmentStatus {
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  FULFILLED = "fulfilled",
  BOOKED = "booked",
  DEFAULT = "default",
}

export const BookingZodSchema = z.object({
  _id: objectIdIsValid("_id"),
  productId: z.number(),
  orderId: z.number(),
  lineItemId: z.number(),
  lineItemTotal: z.number(),
  customerId: z.number(),
  end: z.coerce.date(),
  start: z.coerce.date(),
  fulfillmentStatus: z.nativeEnum(BookingFulfillmentStatus),
});

export type Booking = z.infer<typeof BookingZodSchema>;
