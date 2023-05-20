import { z } from "zod";

export const BookingModeSchema = z.enum(["upcoming", "completed"]);
export type BookingMode = z.infer<typeof BookingModeSchema>;

const priceSetSchema = z.object({
  amount: z.string(),
  currency_code: z.string(),
});

const LineItemSchema = z.object({
  lineItemId: z.number(),
  productId: z.number(),
  variantId: z.number(),
  title: z.string(),
  priceSet: priceSetSchema,
  totalDiscountSet: priceSetSchema,
  from: z.date(),
  to: z.date(),
  customerId: z.number(),
  status: z.enum(["unfulfilled", "cancelled", "completed"]).optional(),
});

export type BookingLineItem = z.infer<typeof LineItemSchema>;

const BuyerSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string(),
});

const BookingZodSchema = z.object({
  orderId: z.number(),
  cancelReason: z.string().optional(),
  cancelledAt: z.date().optional(),
  buyer: BuyerSchema,
  lineItems: z.array(LineItemSchema),
});

export type Booking = z.infer<typeof BookingZodSchema>;
