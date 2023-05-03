import { z } from "zod";
import {
  BooleanOrStringType,
  NumberOrStringType,
  StringOrObjectIdType,
} from "./zod.types";

export const BlockDateZodSchema = z.object({
  end: z.coerce.date(),
  start: z.coerce.date(),
});

export type ScheduleBlockDate = z.infer<typeof BlockDateZodSchema>;

export const ScheduleProductZodSchema = z.object({
  productId: NumberOrStringType,
  visible: BooleanOrStringType,
  duration: NumberOrStringType,
  breakTime: NumberOrStringType,
});

export type ScheduleProduct = z.infer<typeof ScheduleProductZodSchema>;

export const IntervalZodSchema = z.object({
  from: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
  to: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
});

export type ScheduleInterval = z.infer<typeof IntervalZodSchema>;

export const ScheduleSlotZodSchema = z.object({
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

export type ScheduleSlot = z.infer<typeof ScheduleSlotZodSchema>;

export const ScheduleSlotsZodSchema = z.array(ScheduleSlotZodSchema).refine(
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
  slots: ScheduleSlotsZodSchema,
  products: z.array(ScheduleProductZodSchema),
  blockDates: z.array(BlockDateZodSchema),
});

export type Schedule = z.infer<typeof ScheduleZodSchema>;
