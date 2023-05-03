import mongoose from "mongoose";
import { z } from "zod";

const BooleanOrStringType = z
  .union([z.boolean(), z.string()])
  .transform((value) =>
    typeof value === "string" && value === "true" ? true : false
  );

const NumberOrStringType = z
  .union([z.number(), z.string()])
  .transform((value) =>
    typeof value === "string" ? parseInt(value, 10) : value
  );

const isValidObjectId = (value: any): value is string =>
  mongoose.Types.ObjectId.isValid(value);

const ObjectIdType = z
  .custom<string>(isValidObjectId, {
    message: "Invalid ObjectId",
  })
  .transform((value) => new mongoose.Types.ObjectId(value));

const StringOrObjectIdType = z.union([z.string(), ObjectIdType]);

export const BlockDateZodSchema = z.object({
  end: z.coerce.date(),
  start: z.coerce.date(),
});

export type ScheduleBlockDate = z.infer<typeof BlockDateZodSchema>;

export const ProductZodSchema = z.object({
  productId: NumberOrStringType,
  visibile: BooleanOrStringType,
  duration: NumberOrStringType,
  breakTime: NumberOrStringType,
});

export type ScheduleProduct = z.infer<typeof ProductZodSchema>;

export const IntervalZodSchema = z.object({
  from: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
  to: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
});

export type ScheduleInterval = z.infer<typeof IntervalZodSchema>;

export const SlotZodSchema = z.object({
  day: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),
  intervals: z.array(IntervalZodSchema),
});

export type ScheduleSlot = z.infer<typeof SlotZodSchema>;

export const SlotsZodSchema = z.array(SlotZodSchema).refine(
  (slots) => {
    const uniqueDays = new Set(slots.map((slot) => slot.day));
    return uniqueDays.size === slots.length;
  },
  {
    message: "Days must be unique within slots array.",
  }
);

export const ScheduleZodSchema = z.object({
  _id: StringOrObjectIdType,
  name: z.string(),
  customerId: NumberOrStringType,
  slots: SlotsZodSchema,
  products: z.array(ProductZodSchema),
  blockDates: z.array(BlockDateZodSchema),
});

export type Schedule = z.infer<typeof ScheduleZodSchema>;
