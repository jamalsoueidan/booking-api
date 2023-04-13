import { z } from "zod";
import { Customer } from "~/functions/customer";
import { Product } from "~/functions/product";
import { User } from "~/functions/user";
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
  userId: objectIdIsValid("userId"),
  end: z.coerce.date(),
  start: z.coerce.date(),
  anyAvailable: z.boolean().optional(),
  fulfillmentStatus: z.nativeEnum(BookingFulfillmentStatus),
  title: z.string(),
  timeZone: z.string(),
  isEdit: z.boolean().optional(),
  isSelfBooked: z.boolean().optional(),
});

export type Booking = z.infer<typeof BookingZodSchema>;

export type BookingWithLookup = Booking & {
  customer: Customer;
  product: Product;
  user: User;
};

export type BookingServiceCreateProps = Pick<
  Booking,
  "customerId" | "end" | "productId" | "userId" | "start"
>;
