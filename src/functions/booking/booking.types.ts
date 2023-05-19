import { z } from "zod";

const LineItemSchema = z.object({
  lineItemId: z.number(),
  productId: z.number(),
  variantId: z.number(),
  title: z.string(),
  price: z.string(),
  total_discount: z.string(),
  from: z.date(),
  to: z.date(),
  customerId: z.number(),
  status: z.enum(["unfulfilled", "cancelled", "completed"]),
});

const BuyerSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string(),
});

const BookingZodSchema = z.object({
  orderId: z.number(),
  buyer: BuyerSchema,
  lineItems: z.array(LineItemSchema),
});

export type Booking = z.infer<typeof BookingZodSchema>;
