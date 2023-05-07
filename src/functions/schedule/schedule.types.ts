import { z } from "zod";
import {
  BooleanOrStringType,
  GidFormat,
  NumberOrStringType,
  StringOrObjectIdType,
} from "~/library/zod";

export enum TimeUnit {
  HOURS = "hours",
  DAYS = "days",
  WEEKS = "weeks",
  MONTHS = "months",
}

export type Days =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const BookingPeriodZodSchema = z.object({
  value: z.number().min(1, "Value must be greater than or equal to 1"),
  unit: z.enum([TimeUnit.WEEKS, TimeUnit.MONTHS]),
});

const NoticePeriodZodSchema = z.object({
  value: z.number().min(1, "Value must be greater than or equal to 1"),
  unit: z.enum([
    TimeUnit.HOURS,
    TimeUnit.DAYS,
    TimeUnit.WEEKS,
    TimeUnit.MONTHS,
  ]),
});

export const ScheduleProductZodSchema = z.object({
  productId: GidFormat,
  visible: BooleanOrStringType,
  duration: NumberOrStringType,
  breakTime: NumberOrStringType,
  noticePeriod: NoticePeriodZodSchema,
  bookingPeriod: BookingPeriodZodSchema,
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

export const ScheduleSlotsZodSchema = z
  .array(ScheduleSlotZodSchema)
  .transform((slots) => slots.filter((slot) => slot.intervals.length > 0))
  .refine(
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
  customerId: GidFormat,
  slots: ScheduleSlotsZodSchema,
  products: z.array(ScheduleProductZodSchema),
});

export type Schedule = z.infer<typeof ScheduleZodSchema>;
