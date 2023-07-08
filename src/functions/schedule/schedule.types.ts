import { z } from "zod";
import { LocationTypes } from "~/functions/location";
import {
  GidFormat,
  NumberOrStringType,
  StringOrObjectIdType,
} from "~/library/zod";
import { User } from "../user";

export enum TimeUnit {
  HOURS = "hours",
  DAYS = "days",
  WEEKS = "weeks",
  MONTHS = "months",
}

export type WeekDays =
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

export type ScheduleProductBookingPeriod = z.infer<
  typeof BookingPeriodZodSchema
>;

const NoticePeriodZodSchema = z.object({
  value: NumberOrStringType,
  unit: z.enum([
    TimeUnit.HOURS,
    TimeUnit.DAYS,
    TimeUnit.WEEKS,
    TimeUnit.MONTHS,
  ]),
});

export type ScheduleProductNoticePeriod = z.infer<typeof NoticePeriodZodSchema>;

const LocationZodSchema = z.object({
  location: StringOrObjectIdType,
  locationType: z.nativeEnum(LocationTypes),
});

export type ScheduleProductLocation = z.infer<typeof LocationZodSchema>;

export const ScheduleProductZodSchema = z.object({
  productId: GidFormat,
  variantId: GidFormat,
  description: z.string().optional(),
  duration: NumberOrStringType,
  breakTime: NumberOrStringType,
  noticePeriod: NoticePeriodZodSchema,
  bookingPeriod: BookingPeriodZodSchema,
  locations: z.array(LocationZodSchema),
});

export type ScheduleProduct = z.infer<typeof ScheduleProductZodSchema>;

const HourMinuteSchema = z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/);

export const IntervalZodSchema = z
  .object({
    from: HourMinuteSchema,
    to: HourMinuteSchema,
  })
  .refine(
    (data) => {
      const from = data.from.split(":").map(Number);
      const to = data.to.split(":").map(Number);

      // check if 'from' is before 'to'
      if (from[0] > to[0] || (from[0] === to[0] && from[1] >= to[1])) {
        return false;
      }

      // check if the interval is minimum one hour
      if (to[0] - from[0] < 1 && to[1] <= from[1]) {
        return false;
      }

      return true;
    },
    {
      message: "Invalid interval: 'from' must be at least an hour before 'to'",
    }
  );

export type ScheduleInterval = z.infer<typeof IntervalZodSchema>;

const IntervalArraySchema = z.array(IntervalZodSchema).refine(
  (data) => {
    const intervals = data
      .map((interval) => ({
        from: interval.from.split(":").map(Number),
        to: interval.to.split(":").map(Number),
      }))
      .sort((a, b) => a.from[0] - b.from[0] || a.from[1] - b.from[1]); // sorting

    for (let i = 0; i < intervals.length - 1; i++) {
      if (
        intervals[i].to[0] > intervals[i + 1].from[0] ||
        (intervals[i].to[0] === intervals[i + 1].from[0] &&
          intervals[i].to[1] >= intervals[i + 1].from[1])
      ) {
        return false;
      }
    }
    return true;
  },
  {
    message: "Invalid schedule: intervals cannot overlap",
  }
);
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
  intervals: IntervalArraySchema,
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
  date: Date;
  customer: Pick<User, "fullname" | "customerId">;
  slots: {
    from: Date;
    to: Date;
    products: {
      productId: number;
      variantId: number;
      from: Date;
      to: Date;
      breakTime: number;
      duration: number;
    }[];
  }[];
};
