import { z } from "zod";
import {
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
  value: NumberOrStringType,
  unit: z.enum([TimeUnit.WEEKS, TimeUnit.MONTHS]),
});

const NoticePeriodZodSchema = z.object({
  value: NumberOrStringType,
  unit: z.enum([
    TimeUnit.HOURS,
    TimeUnit.DAYS,
    TimeUnit.WEEKS,
    TimeUnit.MONTHS,
  ]),
});

export const ScheduleProductZodSchema = z.object({
  productId: GidFormat,
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
  .superRefine((slots, ctx) => {
    const dayIndexMap = new Map();
    let duplicateIndex = -1;

    slots.forEach((slot, index) => {
      if (dayIndexMap.has(slot.day)) {
        duplicateIndex = index;
      } else {
        dayIndexMap.set(slot.day, index);
      }
    });

    if (duplicateIndex !== -1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate day found at index ${duplicateIndex}`,
        path: [`slots[${duplicateIndex}].day`],
      });
      return false;
    }
    return true;
  });

export const ScheduleZodSchema = z.object({
  _id: StringOrObjectIdType,
  name: z.string(),
  customerId: GidFormat,
  slots: ScheduleSlotsZodSchema,
  products: z.array(ScheduleProductZodSchema),
});

export type Schedule = z.infer<typeof ScheduleZodSchema>;

export type Availability = {
  day: string;
  slots: {
    from: string;
    to: string;
    products: {
      productId: number;
      from: string;
      to: string;
      breakTime: number;
    }[];
  }[];
};
